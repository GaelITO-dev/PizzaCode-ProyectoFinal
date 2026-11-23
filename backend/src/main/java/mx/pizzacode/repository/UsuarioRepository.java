package mx.pizzacode.repository;

import mx.pizzacode.entity.EstadoUsuario;
import mx.pizzacode.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @EntityGraph(attributePaths = "rol")
    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    @EntityGraph(attributePaths = "rol")
    @Query("""
            SELECT u FROM Usuario u
            WHERE (:rol IS NULL OR u.rol.nombre = :rol)
              AND (:estado IS NULL OR u.estado = :estado)
              AND (:busqueda IS NULL
                   OR LOWER(CONCAT(u.nombre, ' ', u.apellidoPat, ' ', COALESCE(u.apellidoMat, ''))) LIKE :busqueda
                   OR LOWER(u.correo) LIKE :busqueda
                   OR (:telefono IS NOT NULL AND u.telefono LIKE :telefono))
            """)
    Page<Usuario> buscar(@Param("rol") String rol,
                         @Param("estado") EstadoUsuario estado,
                         @Param("busqueda") String busqueda,
                         @Param("telefono") String telefono,
                         Pageable pageable);

    long countByRol_Nombre(String nombre);

    long countByEstado(EstadoUsuario estado);
}