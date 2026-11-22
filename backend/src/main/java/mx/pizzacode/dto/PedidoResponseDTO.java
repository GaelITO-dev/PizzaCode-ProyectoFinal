package mx.pizzacode.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.pizzacode.entity.EstadoPedido;
import mx.pizzacode.entity.MetodoPago;
import mx.pizzacode.entity.OrigenPedido;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponseDTO {

    private Integer idPedido;

    private LocalDateTime fecha;

    private OrigenPedido origen;

    private MetodoPago metodoPago;

    private EstadoPedido estado;

    private BigDecimal total;

    private String nombreCliente;

    private String telefonoCliente;

    private String nombreCajero;

    private String motivoCancelacion;

    private List<PedidoRenglonResponseDTO> renglones;
}
