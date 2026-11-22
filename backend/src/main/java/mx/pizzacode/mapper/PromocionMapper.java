package mx.pizzacode.mapper;

import java.time.LocalDate;

import mx.pizzacode.dto.PromocionResponseDTO;
import mx.pizzacode.entity.Producto;
import mx.pizzacode.entity.Promocion;

public final class PromocionMapper {

    private PromocionMapper() {
    }

    public static PromocionResponseDTO toResponse(Promocion p) {
        LocalDate hoy = LocalDate.now();
        boolean vigente = !hoy.isBefore(p.getFechaInicio()) && !hoy.isAfter(p.getFechaFin());
        return new PromocionResponseDTO(
                p.getIdPromocion(),
                p.getNombre(),
                p.getDescuento(),
                p.getFechaInicio(),
                p.getFechaFin(),
                vigente,
                p.getProductos().stream().map(Producto::getIdProducto).toList(),
                p.getProductos().stream().map(Producto::getNombre).toList()
        );
    }
}