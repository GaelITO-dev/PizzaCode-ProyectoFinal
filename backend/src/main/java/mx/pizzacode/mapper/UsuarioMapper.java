package mx.pizzacode.mapper;

import mx.pizzacode.dto.RolDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.entity.Usuario;

public final class UsuarioMapper {

    private UsuarioMapper() {
    }

    public static UsuarioResponseDTO toResponse(Usuario usuario) {
        RolDTO rol = new RolDTO(
                usuario.getRol().getIdRol(),
                usuario.getRol().getNombre()
        );

        return new UsuarioResponseDTO(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellidoPat(),
                usuario.getApellidoMat(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                rol,
                usuario.getEstado(),
                usuario.getMotivoBloqueo()
        );
    }
}
