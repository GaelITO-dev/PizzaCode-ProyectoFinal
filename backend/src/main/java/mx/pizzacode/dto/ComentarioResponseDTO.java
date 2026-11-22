package mx.pizzacode.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.pizzacode.entity.TipoComentario;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComentarioResponseDTO {
    private Integer idComentario;
    private TipoComentario tipo;
    private String texto;
    private Boolean visible;
    private LocalDateTime fecha;
    private String nombreUsuario;
}