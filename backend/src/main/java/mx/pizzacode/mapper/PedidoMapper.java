package mx.pizzacode.mapper;

import java.math.BigDecimal;
import java.util.List;

import mx.pizzacode.dto.PedidoRenglonResponseDTO;
import mx.pizzacode.dto.PedidoResumenResponseDTO;
import mx.pizzacode.dto.PedidoResponseDTO;
import mx.pizzacode.entity.Pedido;
import mx.pizzacode.entity.PedidoProducto;
import mx.pizzacode.entity.Usuario;

public final class PedidoMapper {

    private PedidoMapper() {
    }

    public static PedidoResumenResponseDTO toResumen(Pedido pedido) {
        return new PedidoResumenResponseDTO(
                pedido.getIdPedido(),
                pedido.getFecha(),
                pedido.getOrigen(),
                pedido.getMetodoPago(),
                pedido.getEstado(),
                pedido.getTotal(),
                nombreCliente(pedido),
                telefonoCliente(pedido),
                nombreCajero(pedido)
        );
    }

    public static PedidoResponseDTO toResponse(Pedido pedido, List<PedidoProducto> renglones) {
        List<PedidoRenglonResponseDTO> listaRenglones = renglones == null ? List.of()
                : renglones.stream().map(PedidoMapper::toRenglonResponse).toList();

        return new PedidoResponseDTO(
                pedido.getIdPedido(),
                pedido.getFecha(),
                pedido.getOrigen(),
                pedido.getMetodoPago(),
                pedido.getEstado(),
                pedido.getTotal(),
                nombreCliente(pedido),
                telefonoCliente(pedido),
                nombreCajero(pedido),
                pedido.getMotivoCancelacion(),
                listaRenglones
        );
    }

    public static PedidoRenglonResponseDTO toRenglonResponse(PedidoProducto renglon) {
        BigDecimal precioUnitario = renglon.getPrecioUnitario();
        BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(renglon.getCantidad()));

        return new PedidoRenglonResponseDTO(
                renglon.getProducto().getIdProducto(),
                renglon.getProducto().getNombre(),
                renglon.getCantidad(),
                precioUnitario,
                subtotal
        );
    }

    private static String nombreCliente(Pedido pedido) {
        Usuario cliente = pedido.getCliente();
        if (cliente != null) {
            return cliente.getNombre() + " " + cliente.getApellidoPat();
        }
        return pedido.getNombreCliente();
    }

    private static String telefonoCliente(Pedido pedido) {
        Usuario cliente = pedido.getCliente();
        if (cliente != null) {
            return cliente.getTelefono();
        }
        return pedido.getTelefonoCliente();
    }

    private static String nombreCajero(Pedido pedido) {
        Usuario cajero = pedido.getCajero();
        if (cajero == null) {
            return null;
        }
        return cajero.getNombre() + " " + cajero.getApellidoPat();
    }
}
