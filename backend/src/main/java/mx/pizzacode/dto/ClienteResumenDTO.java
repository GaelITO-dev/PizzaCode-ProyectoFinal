package mx.pizzacode.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Lo mínimo que el cajero necesita para ligar un pedido a la cuenta de un cliente
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClienteResumenDTO {

    private Integer idUsuario;
    private String nombre;
    private String apellidoPat;
    private String apellidoMat;
    private String correo;
    private String telefono;
}
