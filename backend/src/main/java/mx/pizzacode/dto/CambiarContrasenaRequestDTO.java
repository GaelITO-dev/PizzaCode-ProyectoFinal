package mx.pizzacode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CambiarContrasenaRequestDTO {

    @NotBlank(message = "La contraseña actual es obligatoria")
    private String contrasenaActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Pattern(
            regexp = "^(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?¿¡]).{8,72}$",
            message = "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial"
    )
    private String contrasenaNueva;
}
