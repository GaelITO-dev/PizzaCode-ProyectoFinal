package mx.pizzacode.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.pizzacode.entity.Categoria;
import mx.pizzacode.entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    @EntityGraph(attributePaths = { "categoria" })
    Page<Producto> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "categoria" })
    Page<Producto> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    @EntityGraph(attributePaths = { "categoria" })
    Page<Producto> findByDisponible(boolean disponible, Pageable pageable);

    @EntityGraph(attributePaths = { "categoria" })
    Page<Producto> findByCategoria(Categoria categoria, Pageable pageable);
}