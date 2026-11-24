package mx.pizzacode.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.PedidoRenglonRequestDTO;
import mx.pizzacode.dto.PedidoRequestDTO;
import mx.pizzacode.dto.PedidoResponseDTO;
import mx.pizzacode.dto.PedidoResumenResponseDTO;
import mx.pizzacode.entity.EstadoPedido;
import mx.pizzacode.entity.MetodoPago;
import mx.pizzacode.entity.OrigenPedido;
import mx.pizzacode.entity.Pedido;
import mx.pizzacode.entity.PedidoProducto;
import mx.pizzacode.entity.PedidoProductoId;
import mx.pizzacode.entity.Producto;
import mx.pizzacode.entity.Usuario;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.mapper.PedidoMapper;
import mx.pizzacode.repository.PedidoProductoRepository;
import mx.pizzacode.repository.PedidoRepository;
import mx.pizzacode.repository.ProductoRepository;
import mx.pizzacode.repository.PromocionRepository;
import mx.pizzacode.repository.UsuarioRepository;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoProductoRepository pedidoProductoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PromocionRepository promocionRepository;

    public PedidoService(PedidoRepository pedidoRepository, PedidoProductoRepository pedidoProductoRepository,
                         ProductoRepository productoRepository, UsuarioRepository usuarioRepository,
                         PromocionRepository promocionRepository) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoProductoRepository = pedidoProductoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.promocionRepository = promocionRepository;
    }

    // ---------- Metodos de consultas -------------------------------------------------------------------

    // Cajero/Admin: filtros opcionales. "hasta" incluye todo ese día.
    // "busqueda" encuentra por folio (1045 o #1045), parte del nombre o parte del teléfono.
    @Transactional(readOnly = true)
    public Page<PedidoResumenResponseDTO> listar(EstadoPedido estado, LocalDate desde, LocalDate hasta,
                                                 Integer idCliente, String telefono, OrigenPedido origen,
                                                 MetodoPago metodoPago, String busqueda, Pageable pageable) {
        LocalDateTime inicio = desde == null ? null : desde.atStartOfDay();
        LocalDateTime fin = hasta == null ? null : hasta.plusDays(1).atStartOfDay();
        String tel = (telefono == null || telefono.isBlank()) ? null : telefono.trim();

        // Un solo cuadro de búsqueda se convierte en tres criterios
        String texto = busqueda == null ? "" : busqueda.replace("#", "").trim().toLowerCase();
        String patronNombre = texto.isEmpty() ? null : "%" + texto + "%";
        String digitos = texto.replaceAll("\\D", "");
        String patronTelefono = digitos.isEmpty() ? null : "%" + digitos + "%";
        Integer folio = texto.matches("\\d{1,9}") ? Integer.valueOf(texto) : null;

        return conProductos(pedidoRepository.buscar(estado, inicio, fin, idCliente, tel, origen, metodoPago,
                patronNombre, patronTelefono, folio, pageable));
    }

    // Cliente: solo sus pedidos. filtro: EN_CURSO, ENTREGADO o CANCELADO (null = todos); buscar: folio o producto
    @Transactional(readOnly = true)
    public Page<PedidoResumenResponseDTO> misPedidos(String correo, String filtro, String buscar, Pageable pageable) {
        Integer idCliente = buscarUsuario(correo).getIdUsuario();
        String texto = (buscar == null || buscar.isBlank()) ? null : buscar.trim();
        return conProductos(pedidoRepository.buscarDelCliente(idCliente, estadosDelFiltro(filtro), texto, pageable));
    }

    @Transactional(readOnly = true)
    public PedidoResponseDTO obtener(Integer id) {
        return detalle(buscarPedido(id));
    }

    // Cliente: si el pedido no es suyo, responde 404 (no se revela que exista)
    @Transactional(readOnly = true)
    public PedidoResponseDTO obtenerMio(Integer id, String correo) {
        Pedido pedido = buscarPedido(id);
        if (pedido.getCliente() == null || !pedido.getCliente().getCorreo().equals(correo)) {
            throw new NoSuchElementException("No se encontró el pedido con id " + id);
        }
        return detalle(pedido);
    }

    // ---------- Metodos de creacion  ------------------------------------------------------------------------

    @Transactional
    public PedidoResponseDTO crearEnLinea(PedidoRequestDTO dto, String correoCliente) {
        Pedido pedido = new Pedido();
        pedido.setOrigen(OrigenPedido.EN_LINEA);
        pedido.setCliente(buscarUsuario(correoCliente));
        return guardar(pedido, dto);
    }

    @Transactional
    public PedidoResponseDTO crearEnSucursal(PedidoRequestDTO dto, String correoCajero) {
        Pedido pedido = new Pedido();
        pedido.setOrigen(OrigenPedido.SUCURSAL);
        pedido.setCajero(buscarUsuario(correoCajero));
        if (dto.getCorreoCliente() != null && !dto.getCorreoCliente().isBlank()) {
            pedido.setCliente(buscarUsuario(dto.getCorreoCliente()));
        } else {
            pedido.setNombreCliente(dto.getNombreCliente());
            pedido.setTelefonoCliente(dto.getTelefonoCliente());
        }
        return guardar(pedido, dto);
    }

    // ---------- Metodo para cambiar el estado -------------------------------------------------------

    // Solo avanza un paso: RECIBIDO -> EN_PREPARACION -> LISTO -> ENTREGADO
    @Transactional
    public PedidoResumenResponseDTO cambiarEstado(Integer id, EstadoPedido nuevo) {
        Pedido pedido = buscarPedido(id);
        EstadoPedido actual = pedido.getEstado();
        if (nuevo == EstadoPedido.CANCELADO || actual == EstadoPedido.CANCELADO
                || nuevo.ordinal() != actual.ordinal() + 1) {
            throw new ReglaNegocioException("No se puede pasar el pedido de " + actual + " a " + nuevo);
        }
        pedido.setEstado(nuevo);
        return PedidoMapper.toResumen(pedido);
    }

    @Transactional
    public PedidoResumenResponseDTO cancelar(Integer id, String motivo) {
        Pedido pedido = buscarPedido(id);
        if (pedido.getEstado() == EstadoPedido.ENTREGADO || pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new ReglaNegocioException("No se puede cancelar un pedido " + pedido.getEstado());
        }
        pedido.setEstado(EstadoPedido.CANCELADO);
        pedido.setMotivoCancelacion(motivo.trim());
        return PedidoMapper.toResumen(pedido);
    }

    // ----------Metodos privados que sirven en diversos procedimientos de arriba------------------------ ----------

    private PedidoResponseDTO guardar(Pedido pedido, PedidoRequestDTO dto) {
        List<PedidoProducto> renglones = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (PedidoRenglonRequestDTO r : dto.getRenglones()) {
            Producto producto = productoRepository.findById(r.getIdProducto())
                    .filter(Producto::getDisponible)
                    .orElseThrow(() -> new ReglaNegocioException(
                            "El producto con id " + r.getIdProducto() + " no existe o no está disponible"));

            PedidoProducto renglon = new PedidoProducto();
            renglon.setProducto(producto);
            renglon.setCantidad(r.getCantidad());
            BigDecimal precio = precioConDescuento(producto); // aplica la promoción vigente, si hay
            renglon.setPrecioUnitario(precio);
            renglones.add(renglon);
            total = total.add(precio.multiply(BigDecimal.valueOf(r.getCantidad())));
        }

        pedido.setMetodoPago(dto.getMetodoPago());
        pedido.setTotal(total);
        pedidoRepository.save(pedido);

        for (PedidoProducto renglon : renglones) {
            renglon.setPedido(pedido);
            renglon.setId(new PedidoProductoId(pedido.getIdPedido(), renglon.getProducto().getIdProducto()));
        }
        pedidoProductoRepository.saveAll(renglones);

        return PedidoMapper.toResponse(pedido, renglones);
    }

    // 1 consulta para los renglones de toda la página, en lugar de 1 por pedido (evita N+1)
    private Page<PedidoResumenResponseDTO> conProductos(Page<Pedido> pagina) {
        List<Integer> ids = pagina.getContent().stream().map(Pedido::getIdPedido).toList();

        Map<Integer, List<PedidoProducto>> renglonesPorPedido = ids.isEmpty()
                ? Map.of()
                : pedidoProductoRepository.findByPedido_IdPedidoIn(ids).stream()
                        .collect(Collectors.groupingBy(r -> r.getPedido().getIdPedido()));

        return pagina.map(pedido -> PedidoMapper.toResumen(
                pedido, renglonesPorPedido.getOrDefault(pedido.getIdPedido(), List.of())));
    }

    // Precio con el mayor descuento vigente hoy. Ej. 199.00 con 15% -> 169.15
    private BigDecimal precioConDescuento(Producto producto) {
        BigDecimal descuento = promocionRepository.mejorDescuento(producto.getIdProducto(), LocalDate.now());
        if (descuento == null) {
            return producto.getPrecio();
        }
        BigDecimal porcentajeAPagar = BigDecimal.valueOf(100).subtract(descuento);
        return producto.getPrecio().multiply(porcentajeAPagar)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private List<EstadoPedido> estadosDelFiltro(String filtro) {
        if (filtro == null || filtro.isBlank()) {
            return List.of(EstadoPedido.values());
        }
        return switch (filtro) {
            case "EN_CURSO" -> List.of(EstadoPedido.RECIBIDO, EstadoPedido.EN_PREPARACION, EstadoPedido.LISTO);
            case "ENTREGADO" -> List.of(EstadoPedido.ENTREGADO);
            case "CANCELADO" -> List.of(EstadoPedido.CANCELADO);
            default -> throw new ReglaNegocioException("Filtro no válido: usa EN_CURSO, ENTREGADO o CANCELADO");
        };
    }

    private PedidoResponseDTO detalle(Pedido pedido) {
        return PedidoMapper.toResponse(pedido, pedidoProductoRepository.findByPedido_IdPedido(pedido.getIdPedido()));
    }

    private Pedido buscarPedido(Integer id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el pedido con id " + id));
    }

    private Usuario buscarUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo.trim())
                .orElseThrow(() -> new ReglaNegocioException("No existe un usuario con el correo " + correo));
    }
}