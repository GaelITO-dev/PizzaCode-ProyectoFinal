package mx.pizzacode.mapper;

import mx.pizzacode.dto.ComentarioResponseDTO;
import mx.pizzacode.entity.Comentario;

public final class ComentarioMapper {

    private ComentarioMapper() {
    }

    public static ComentarioResponseDTO toResponse(Comentario c) {
        return new ComentarioResponseDTO(
                c.getIdComentario(),
                c.getTipo(),
                c.getTexto(),
                c.getVisible(),
                c.getFecha(),
                c.getUsuario().getNombre() + " " + c.getUsuario().getApellidoPat()
        );
    }
}