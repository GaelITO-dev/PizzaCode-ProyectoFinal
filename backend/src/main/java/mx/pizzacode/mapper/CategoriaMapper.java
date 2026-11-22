package mx.pizzacode.mapper;

import mx.pizzacode.dto.CategoriaResponseDTO;
import mx.pizzacode.entity.Categoria;

public final class CategoriaMapper {

    private CategoriaMapper() {
    }

    public static CategoriaResponseDTO toResponse(Categoria categoria) {
        return new CategoriaResponseDTO(
                categoria.getIdCategoria(),
                categoria.getNombre()
        );
    }
}
