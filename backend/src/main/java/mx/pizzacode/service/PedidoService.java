package mx.pizzacode.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.PedidoRenglonRequestDTO;
import mx.pizzacode.dto.PedidoRequestDTO;
import mx.pizzacode.dto.PedidoResponseDTO;
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

    public PedidoService(PedidoRepository pedidoRepository, PedidoProductoRepository pedidoProductoRepository,
                         ProductoRepository productoRepository, UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoProductoRepository = pedidoProductoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Cliente desde la app
    @Transactional
    public PedidoResponseDTO crearEnLinea(PedidoRequestDTO dto, String correoCliente) {
        Pedido pedido = new Pedido();
        pedido.setOrigen(OrigenPedido.EN_LINEA);
        pedido.setCliente(buscarUsuario(correoCliente));
        return guardar(pedido, dto);
    }

    // Cajero en sucursal: con correo si el cliente tiene cuenta; si no, nombre y teléfono
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

    private Usuario buscarUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo.trim())
                .orElseThrow(() -> new ReglaNegocioException("No existe un usuario con el correo " + correo));
    }
}