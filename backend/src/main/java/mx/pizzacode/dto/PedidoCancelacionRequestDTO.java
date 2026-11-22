package mx.pizzacode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoCancelacionRequestDTO {

    @NotBlank(message = "El motivo de cancelación es obligatorio")
    @Size(max = 255, message = "El motivo de cancelación no debe superar los 255 caracteres")
    private String motivo;
}
