package mx.pizzacode.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.pizzacode.entity.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    Page<Categoria> findAllByNombreContainingIgnoreCase(String nombre, Pageable pageable);
}
