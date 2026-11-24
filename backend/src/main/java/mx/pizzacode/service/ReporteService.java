package mx.pizzacode.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.MontoPorGrupoDTO;
import mx.pizzacode.dto.ProductoVendidoDTO;
import mx.pizzacode.dto.PuntoVentasDTO;
import mx.pizzacode.dto.ReporteGananciasDTO;
import mx.pizzacode.entity.EstadoPedido;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.repository.ReportePedidoRepository;

@Service
public class ReporteService {

    private static final int TOP_PRODUCTOS = 5;
    private static final long MAXIMO_DIAS = 366;
    private static final EstadoPedido CANCELADO = EstadoPedido.CANCELADO;

    private final ReportePedidoRepository reporteRepository;

    public ReporteService(ReportePedidoRepository reporteRepository) {
        this.reporteRepository = reporteRepository;
    }

    private record Totales(long pedidos, BigDecimal monto) {
    }

    @Transactional(readOnly = true)
    public ReporteGananciasDTO ganancias(LocalDate desde, LocalDate hasta) {
        if (hasta.isBefore(desde)) {
            throw new ReglaNegocioException("La fecha 'hasta' no puede ser anterior a 'desde'");
        }
        long dias = ChronoUnit.DAYS.between(desde, hasta) + 1;
        if (dias > MAXIMO_DIAS) {
            throw new ReglaNegocioException("El rango no puede ser mayor a " + MAXIMO_DIAS + " días");
        }

        // "hasta" incluye todo ese día: se busca hasta el inicio del día siguiente (sin incluirlo)
        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.plusDays(1).atStartOfDay();

        LocalDate[] anterior = periodoAnterior(desde, hasta, dias);
        Totales actuales = totales(inicio, fin);
        Totales previos = totales(anterior[0].atStartOfDay(), anterior[1].plusDays(1).atStartOfDay());
        Object[] cancelados = primeraFila(reporteRepository.totalesConEstado(inicio, fin, CANCELADO));
        boolean porHora = desde.equals(hasta);

        ReporteGananciasDTO reporte = new ReporteGananciasDTO();
        reporte.setDesde(desde);
        reporte.setHasta(hasta);
        reporte.setVentas(actuales.monto());
        reporte.setPedidos(actuales.pedidos());
        reporte.setTicketPromedio(promedio(actuales));

        reporte.setDesdeAnterior(anterior[0]);
        reporte.setHastaAnterior(anterior[1]);
        reporte.setVentasAnterior(previos.monto());
        reporte.setPedidosAnterior(previos.pedidos());
        reporte.setTicketPromedioAnterior(promedio(previos));

        reporte.setCancelados(contar(cancelados[0]));
        reporte.setMontoCancelado(monto(cancelados[1]));

        reporte.setAgrupacion(porHora ? "HORA" : "DIA");
        reporte.setSerie(porHora
                ? serieHoras(reporteRepository.ventasPorHora(inicio, fin))
                : serieDias(reporteRepository.ventasPorDia(inicio, fin), desde, hasta));

        reporte.setPorOrigen(grupos(reporteRepository.ventasPorOrigen(inicio, fin, CANCELADO)));
        reporte.setPorMetodoPago(grupos(reporteRepository.ventasPorMetodoPago(inicio, fin, CANCELADO)));
        reporte.setMasVendidos(reporteRepository
                .masVendidos(inicio, fin, CANCELADO, PageRequest.of(0, TOP_PRODUCTOS))
                .stream()
                .map(f -> new ProductoVendidoDTO((Integer) f[0], (String) f[1], contar(f[2]), monto(f[3])))
                .toList());

        return reporte;
    }

    // Mes calendario completo → el mes anterior completo; cualquier otro rango → los mismos días justo antes
    private LocalDate[] periodoAnterior(LocalDate desde, LocalDate hasta, long dias) {
        boolean esMesCompleto = desde.getDayOfMonth() == 1
                && hasta.equals(desde.with(TemporalAdjusters.lastDayOfMonth()));
        if (esMesCompleto) {
            LocalDate inicioMesAnterior = desde.minusMonths(1);
            return new LocalDate[] { inicioMesAnterior, inicioMesAnterior.with(TemporalAdjusters.lastDayOfMonth()) };
        }
        return new LocalDate[] { desde.minusDays(dias), desde.minusDays(1) };
    }

    private Totales totales(LocalDateTime inicio, LocalDateTime fin) {
        Object[] fila = primeraFila(reporteRepository.totalesSinEstado(inicio, fin, CANCELADO));
        return new Totales(contar(fila[0]), monto(fila[1]));
    }

    // Todos los días del rango, con 0 en los días sin ventas (la gráfica no debe tener huecos)
    private List<PuntoVentasDTO> serieDias(List<Object[]> filas, LocalDate desde, LocalDate hasta) {
        Map<String, Object[]> porClave = indexar(filas);
        List<PuntoVentasDTO> serie = new ArrayList<>();
        for (LocalDate dia = desde; !dia.isAfter(hasta); dia = dia.plusDays(1)) {
            serie.add(punto(dia.toString(), porClave.get(dia.toString())));
        }
        return serie;
    }

    // De la primera a la última hora con ventas, con 0 en las horas intermedias sin ventas
    private List<PuntoVentasDTO> serieHoras(List<Object[]> filas) {
        if (filas.isEmpty()) {
            return List.of();
        }
        Map<String, Object[]> porClave = indexar(filas);
        int primera = Integer.parseInt(String.valueOf(filas.get(0)[0]));
        int ultima = Integer.parseInt(String.valueOf(filas.get(filas.size() - 1)[0]));
        List<PuntoVentasDTO> serie = new ArrayList<>();
        for (int hora = primera; hora <= ultima; hora++) {
            String clave = String.format("%02d", hora);
            serie.add(punto(clave, porClave.get(clave)));
        }
        return serie;
    }

    private Map<String, Object[]> indexar(List<Object[]> filas) {
        Map<String, Object[]> porClave = new HashMap<>();
        for (Object[] fila : filas) {
            porClave.put(String.valueOf(fila[0]), fila);
        }
        return porClave;
    }

    private PuntoVentasDTO punto(String clave, Object[] fila) {
        return fila == null
                ? new PuntoVentasDTO(clave, 0, monto(null))
                : new PuntoVentasDTO(clave, contar(fila[1]), monto(fila[2]));
    }

    private List<MontoPorGrupoDTO> grupos(List<Object[]> filas) {
        return filas.stream()
                .map(f -> new MontoPorGrupoDTO(((Enum<?>) f[0]).name(), contar(f[1]), monto(f[2])))
                .toList();
    }

    private Object[] primeraFila(List<Object[]> filas) {
        return filas.isEmpty() ? new Object[] { 0L, null } : filas.get(0);
    }

    private BigDecimal promedio(Totales totales) {
        if (totales.pedidos() == 0) {
            return monto(null);
        }
        return totales.monto().divide(BigDecimal.valueOf(totales.pedidos()), 2, RoundingMode.HALF_UP);
    }

    private long contar(Object valor) {
        return valor == null ? 0 : ((Number) valor).longValue();
    }

    // SUM regresa null cuando no hay filas; se convierte en 0.00
    private BigDecimal monto(Object valor) {
        BigDecimal numero = valor == null ? BigDecimal.ZERO
                : valor instanceof BigDecimal decimal ? decimal
                : new BigDecimal(valor.toString());
        return numero.setScale(2, RoundingMode.HALF_UP);
    }
}
