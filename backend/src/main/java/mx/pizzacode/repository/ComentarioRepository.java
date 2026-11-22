package mx.pizzacode.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import mx.pizzacode.entity.Comentario;
import mx.pizzacode.entity.TipoComentario;

public interface ComentarioRepository extends JpaRepository<Comentario, Integer> {

    @EntityGraph(attributePaths = "usuario")
    @Query("""
            SELECT c FROM Comentario c
            WHERE (:tipo IS NULL OR c.tipo = :tipo)
              AND (:visible IS NULL OR c.visible = :visible)
              AND (:correo IS NULL OR c.usuario.correo = :correo)
            """)
    Page<Comentario> buscar(TipoComentario tipo, Boolean visible, String correo, Pageable pageable);
}