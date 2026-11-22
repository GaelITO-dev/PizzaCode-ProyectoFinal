package mx.pizzacode.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.pizzacode.entity.Categoria;
import mx.pizzacode.entity.Producto;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    @EntityGraph(attributePaths = { "categoria" })
    Page<Producto> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "categoria" })
    Page<Producto> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    @EntityGraph(attributePaths = { "categoria" })
    Page<Producto> findByDisponible(boolean disponible, Pageable pageable);

    @EntityGraph(attributePaths = { "categoria" })
    Page<Producto> findByCategoria(Categoria categoria, Pageable pageable);

    boolean existsByCategoria_IdCategoria(Integer idCategoria);

    // Filtros opcionales: cada condición aplica solo si el parámetro no es null.
    @EntityGraph(attributePaths = "categoria")
    @Query("""
            SELECT p FROM Producto p
            WHERE (:nombre IS NULL OR p.nombre LIKE CONCAT('%', :nombre, '%'))
              AND (:idCategoria IS NULL OR p.categoria.idCategoria = :idCategoria)
              AND (:disponible IS NULL OR p.disponible = :disponible)
            """)
    Page<Producto> buscar(String nombre, Integer idCategoria, Boolean disponible, Pageable pageable);


}