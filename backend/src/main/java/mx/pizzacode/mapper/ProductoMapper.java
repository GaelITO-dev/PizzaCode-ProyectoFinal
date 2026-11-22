package mx.pizzacode.mapper;

import mx.pizzacode.dto.ProductoResponseDTO;
import mx.pizzacode.entity.Producto;

public final class ProductoMapper {

    private ProductoMapper() {
    }

    public static ProductoResponseDTO toResponse(Producto producto) {
        return new ProductoResponseDTO(
                producto.getIdProducto(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getImagen(),
                producto.getDisponible(),
                producto.getCategoria().getIdCategoria(),
                producto.getCategoria().getNombre()
        );
    }
}
