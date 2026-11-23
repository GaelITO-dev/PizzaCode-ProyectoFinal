package mx.pizzacode.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EditarUsuarioRequestDTO {

    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = ".*\\S.*", message = "El nombre no puede estar vacío")
    private String nombre;

    @Size(min = 2, max = 50, message = "El apellido paterno debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = ".*\\S.*", message = "El apellido paterno no puede estar vacío")
    private String apellidoPat;

    @Size(max = 50, message = "El apellido materno no debe superar los 50 caracteres")
    private String apellidoMat;

    @Pattern(regexp = "^\\d{10,15}$", message = "El teléfono debe contener entre 10 y 15 dígitos")
    private String telefono;

    @Pattern(regexp = "CAJERO|ADMIN", message = "El rol debe ser CAJERO o ADMIN")
    private String rol;
}
