package mx.pizzacode.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LikeResponseDTO {
    private Integer idComentario;
    private Long totalLikes;
    private Boolean yaDioLike;
}