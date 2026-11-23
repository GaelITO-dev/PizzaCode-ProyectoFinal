package mx.pizzacode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BloqueoRequestDTO {

    @NotBlank(message = "El motivo del bloqueo es obligatorio")
    @Size(max = 255, message = "El motivo no debe superar los 255 caracteres")
    private String motivo;
}
