package mx.pizzacode.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.pizzacode.entity.EstadoPedido;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoEstadoRequestDTO {

    @NotNull(message = "El estado es obligatorio")
    private EstadoPedido estado;
}
