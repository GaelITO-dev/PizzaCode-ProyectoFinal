package mx.pizzacode.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponseDTO {

    private Integer idProducto;

    private String nombre;

    private String descripcion;

    private BigDecimal precio;

    private String imagen;

    private Boolean disponible;

    private Integer idCategoria;

    private String nombreCategoria;
}
