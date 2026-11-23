package mx.pizzacode.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResumenUsuariosDTO {

    private long clientes;
    private long cajeros;
    private long administradores;
    private long bloqueados;
}
