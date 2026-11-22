package mx.pizzacode.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.pizzacode.entity.EstadoUsuario;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioActualizacionDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido paterno es obligatorio")
    @Size(min = 2, max = 50, message = "El apellido paterno debe tener entre 2 y 50 caracteres")
    private String apellidoPat;

    @Size(max = 50, message = "El apellido materno no debe superar los 50 caracteres")
    private String apellidoMat;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 100, message = "El correo no debe superar los 100 caracteres")
    private String correo;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^\\d{10,15}$", message = "El teléfono debe contener entre 10 y 15 dígitos")
    private String telefono;

    @NotNull(message = "El rol es obligatorio")
    @Positive(message = "El rol seleccionado no es válido")
    private Integer idRol;

    @NotNull(message = "El estado es obligatorio")
    private EstadoUsuario estado;

    @Size(max = 255, message = "El motivo de bloqueo no debe superar los 255 caracteres")
    private String motivoBloqueo;

   
    @JsonIgnore
    @AssertTrue(message = "El motivo de bloqueo es obligatorio cuando el estado es BLOQUEADO")
    public boolean isMotivoBloqueoValido() {
        return estado != EstadoUsuario.BLOQUEADO
                || (motivoBloqueo != null && !motivoBloqueo.isBlank());
    }
}
