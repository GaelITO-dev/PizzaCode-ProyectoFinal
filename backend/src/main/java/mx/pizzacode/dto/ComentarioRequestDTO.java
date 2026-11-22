package mx.pizzacode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mx.pizzacode.entity.TipoComentario;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComentarioRequestDTO {

    @NotNull(message = "El tipo es obligatorio (COMENTARIO o SUGERENCIA)")
    private TipoComentario tipo;

    @NotBlank(message = "El texto es obligatorio")
    @Size(max = 500, message = "El texto no debe superar los 500 caracteres")
    private String texto;
}