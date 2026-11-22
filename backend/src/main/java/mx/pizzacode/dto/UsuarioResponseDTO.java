package mx.pizzacode.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.pizzacode.entity.EstadoUsuario;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Integer idUsuario;

    private String nombre;

    private String apellidoPat;

    private String apellidoMat;

    private String correo;

    private String telefono;

    private RolDTO rol;

    private EstadoUsuario estado;

    private String motivoBloqueo;
}
