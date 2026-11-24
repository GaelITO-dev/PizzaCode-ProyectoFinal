package mx.pizzacode.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Producto dentro de una promoción (para que el cliente vea su precio y lo agregue al carrito)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PromocionProductoDTO {
    private Integer idProducto;
    private String nombre;
    private BigDecimal precio;
    private Boolean disponible;
    private String imagen;
}
