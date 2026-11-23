package mx.pizzacode.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comentario_likes")
@Getter
@Setter
@NoArgsConstructor
public class ComentarioLike {

    @EmbeddedId
    private ComentarioLikeId id = new ComentarioLikeId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("idComentario")
    @JoinColumn(name = "id_comentario")
    private Comentario comentario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("idUsuario")
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();
}
