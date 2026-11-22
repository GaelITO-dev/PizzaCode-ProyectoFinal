package mx.pizzacode.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;

    private String tipo;

    private Integer idUsuario;

    private String nombre;

    private String apellidoPat;

    private String correo;

    private String rol;
}
