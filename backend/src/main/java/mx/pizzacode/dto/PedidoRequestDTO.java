package mx.pizzacode.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.pizzacode.entity.MetodoPago;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoRequestDTO {

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPago metodoPago;

    @NotEmpty(message = "Se requiere al menos un renglón")
    @Valid
    private List<PedidoRenglonRequestDTO> renglones;

    @Size(max = 100, message = "El nombre del cliente no debe superar los 100 caracteres")
    private String nombreCliente;

    @Pattern(regexp = "^\\d{10,15}$", message = "El teléfono debe contener entre 10 y 15 dígitos")
    private String telefonoCliente;
}
