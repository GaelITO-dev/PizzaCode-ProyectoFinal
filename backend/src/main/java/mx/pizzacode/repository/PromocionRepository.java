package mx.pizzacode.repository;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import mx.pizzacode.entity.Promocion;

public interface PromocionRepository extends JpaRepository<Promocion, Integer> {

    // estado: null = todas; VIGENTE / PROGRAMADA / TERMINADA se calculan con la fecha "hoy"
    @Query("""
            SELECT p FROM Promocion p
            WHERE (:nombre IS NULL OR p.nombre LIKE CONCAT('%', :nombre, '%'))
              AND (:estado IS NULL
                   OR (:estado = 'VIGENTE' AND p.fechaInicio <= :hoy AND p.fechaFin >= :hoy)
                   OR (:estado = 'PROGRAMADA' AND p.fechaInicio > :hoy)
                   OR (:estado = 'TERMINADA' AND p.fechaFin < :hoy))
            """)
    Page<Promocion> buscar(String nombre, String estado, LocalDate hoy, Pageable pageable);
}
