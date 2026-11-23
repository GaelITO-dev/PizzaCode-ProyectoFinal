package mx.pizzacode.mapper;

import java.time.LocalDate;

import mx.pizzacode.dto.PromocionResponseDTO;
import mx.pizzacode.entity.EstadoPromocion;
import mx.pizzacode.entity.Producto;
import mx.pizzacode.entity.Promocion;

public final class PromocionMapper {

    private PromocionMapper() {
    }

    public static PromocionResponseDTO toResponse(Promocion p) {
        LocalDate hoy = LocalDate.now();
        EstadoPromocion estado = hoy.isBefore(p.getFechaInicio()) ? EstadoPromocion.PROGRAMADA
                : hoy.isAfter(p.getFechaFin()) ? EstadoPromocion.TERMINADA
                : EstadoPromocion.VIGENTE;
        return new PromocionResponseDTO(
                p.getIdPromocion(),
                p.getNombre(),
                p.getDescuento(),
                p.getFechaInicio(),
                p.getFechaFin(),
                estado == EstadoPromocion.VIGENTE,
                estado,
                p.getProductos().stream().map(Producto::getIdProducto).toList(),
                p.getProductos().stream().map(Producto::getNombre).toList()
        );
    }
}