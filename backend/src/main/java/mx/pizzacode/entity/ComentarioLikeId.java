package mx.pizzacode.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ComentarioLikeId implements Serializable {

    @Column(name = "id_comentario")
    private Integer idComentario;

    @Column(name = "id_usuario")
    private Integer idUsuario;
}