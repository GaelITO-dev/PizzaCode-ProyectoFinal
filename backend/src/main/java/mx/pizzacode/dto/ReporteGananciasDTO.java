package mx.pizzacode.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReporteGananciasDTO {

    private LocalDate desde;
    private LocalDate hasta;

    // Pedidos NO cancelados del rango
    private BigDecimal ventas;
    private long pedidos;
    private BigDecimal ticketPromedio;

    // Periodo anterior del mismo tamaño, para comparar
    private LocalDate desdeAnterior;
    private LocalDate hastaAnterior;
    private BigDecimal ventasAnterior;
    private long pedidosAnterior;
    private BigDecimal ticketPromedioAnterior;

    // Cancelados del rango: cuántos y cuánto no se cobró
    private long cancelados;
    private BigDecimal montoCancelado;

    // "DIA" (un punto por día) o "HORA" (un punto por hora, cuando desde == hasta)
    private String agrupacion;
    private List<PuntoVentasDTO> serie;

    private List<MontoPorGrupoDTO> porOrigen;
    private List<MontoPorGrupoDTO> porMetodoPago;
    private List<ProductoVendidoDTO> masVendidos;
}
