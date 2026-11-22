package mx.pizzacode.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.pizzacode.entity.EstadoUsuario;
import mx.pizzacode.entity.Rol;
import mx.pizzacode.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @EntityGraph(attributePaths = { "rol" })
    Page<Usuario> findByEstado(EstadoUsuario estado, Pageable pageable);

    Page<Usuario> findByRol(Rol rol, Pageable pageable);

    Page<Usuario> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    Optional<Usuario> findByCorreoIgnoreCase(String correo);
}
