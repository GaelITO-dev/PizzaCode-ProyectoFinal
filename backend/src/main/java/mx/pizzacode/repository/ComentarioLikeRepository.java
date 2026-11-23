package mx.pizzacode.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mx.pizzacode.entity.ComentarioLike;
import mx.pizzacode.entity.ComentarioLikeId;

public interface ComentarioLikeRepository extends JpaRepository<ComentarioLike, ComentarioLikeId> {

    long countByIdIdComentario(Integer idComentario);

    // Conteo de likes de varios comentarios en UNA sola consulta
    @Query("""
            SELECT l.id.idComentario AS idComentario, COUNT(l) AS total
            FROM ComentarioLike l
            WHERE l.id.idComentario IN :ids
            GROUP BY l.id.idComentario
            """)
    List<ConteoLikes> contarPorComentarios(@Param("ids") List<Integer> ids);

    // De esos comentarios, a cuáles les dio like el usuario actual
    @Query("""
            SELECT l.id.idComentario
            FROM ComentarioLike l
            WHERE l.usuario.correo = :correo AND l.id.idComentario IN :ids
            """)
    List<Integer> idsConLikeDelUsuario(@Param("correo") String correo, @Param("ids") List<Integer> ids);
}