package mx.pizzacode.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.PedidoRenglonRequestDTO;
import mx.pizzacode.dto.PedidoRequestDTO;
import mx.pizzacode.dto.PedidoResponseDTO;
import mx.pizzacode.dto.PedidoResumenResponseDTO;
import mx.pizzacode.entity.EstadoPedido;
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
import mx.pizzacode.repository.UsuarioRepository;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoProductoRepository pedidoProductoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SmsService smsService; // SMS #48

    public PedidoService(PedidoRepository pedidoRepository, PedidoProductoRepository pedidoProductoRepository,
                         ProductoRepository productoRepository, UsuarioRepository usuarioRepository,
                         SmsService smsService) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoProductoRepository = pedidoProductoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.smsService = smsService;
    }

    // ---------- Metodos de consultas -------------------------------------------------------------------

    // Cajero/Admin: filtros opcionales. "hasta" incluye todo ese día.
    @Transactional(readOnly = true)
    public Page<PedidoResumenResponseDTO> listar(EstadoPedido estado, LocalDate desde, LocalDate hasta,
                                                 Integer idCliente, String telefono, Pageable pageable) {
        LocalDateTime inicio = desde == null ? null : desde.atStartOfDay();
        LocalDateTime fin = hasta == null ? null : hasta.plusDays(1).atStartOfDay();
        String tel = (telefono == null || telefono.isBlank()) ? null : telefono.trim();
        return pedidoRepository.buscar(estado, inicio, fin, idCliente, tel, pageable)
                .map(PedidoMapper::toResumen);
    }

    // Cliente: solo sus pedidos 
    @Transactional(readOnly = true)
    public Page<PedidoResumenResponseDTO> misPedidos(String correo, Pageable pageable) {
        Integer idCliente = buscarUsuario(correo).getIdUsuario();
        return pedidoRepository.buscar(null, null, null, idCliente, null, pageable)
                .map(PedidoMapper::toResumen);
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
        // SMS #48: avisar al cliente que ya puede recoger su pedido
        if (nuevo == EstadoPedido.LISTO) {
            smsService.enviar(telefonoDe(pedido),
                    "Pizza Code: tu pedido #" + pedido.getIdPedido() + " ya está listo. ¡Te esperamos!");
        }
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
            renglon.setPrecioUnitario(producto.getPrecio());
            renglones.add(renglon);
            total = total.add(producto.getPrecio().multiply(BigDecimal.valueOf(r.getCantidad())));
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

    private PedidoResponseDTO detalle(Pedido pedido) {
        return PedidoMapper.toResponse(pedido, pedidoProductoRepository.findByPedido_IdPedido(pedido.getIdPedido()));
    }

    private Pedido buscarPedido(Integer id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el pedido con id " + id));
    }

    // SMS #48: pedido con cuenta usa el teléfono del cliente; sucursal sin cuenta usa el capturado en el pedido
    private String telefonoDe(Pedido pedido) {
        if (pedido.getCliente() != null) {
            return pedido.getCliente().getTelefono();
        }
        return pedido.getTelefonoCliente();
    }

    private Usuario buscarUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo.trim())
                .orElseThrow(() -> new ReglaNegocioException("No existe un usuario con el correo " + correo));
    }
}