package mx.pizzacode.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import mx.pizzacode.entity.RecuperacionContrasena;

public interface RecuperacionContrasenaRepository extends JpaRepository<RecuperacionContrasena, Integer> {

    @EntityGraph(attributePaths = { "usuario", "usuario.rol" })
    Optional<RecuperacionContrasena> findByTokenHash(String tokenHash);

    // ¿Pidió otro enlace hace poco? (evita llenar el buzón de alguien)
    boolean existsByUsuario_IdUsuarioAndFechaCreacionAfter(Integer idUsuario, LocalDateTime desde);

    // Invalida todos los enlaces vigentes del usuario (al pedir uno nuevo o al usar uno)
    @Modifying
    @Query("""
            UPDATE RecuperacionContrasena r SET r.fechaUso = :ahora
            WHERE r.usuario.idUsuario = :idUsuario AND r.fechaUso IS NULL
            """)
    int invalidarVigentes(Integer idUsuario, LocalDateTime ahora);
}
