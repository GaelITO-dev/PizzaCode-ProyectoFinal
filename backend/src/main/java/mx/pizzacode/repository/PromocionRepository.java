package mx.pizzacode.repository;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import mx.pizzacode.entity.Promocion;

public interface PromocionRepository extends JpaRepository<Promocion, Integer> {

    @Query("""
            SELECT p FROM Promocion p
            WHERE (:nombre IS NULL OR p.nombre LIKE CONCAT('%', :nombre, '%'))
              AND (:hoy IS NULL OR (p.fechaInicio <= :hoy AND p.fechaFin >= :hoy))
            """)
    Page<Promocion> buscar(String nombre, LocalDate hoy, Pageable pageable);
}