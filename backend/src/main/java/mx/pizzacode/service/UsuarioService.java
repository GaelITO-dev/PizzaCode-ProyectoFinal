package mx.pizzacode.service;

import mx.pizzacode.dto.ActualizarPerfilRequestDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.entity.Usuario;
import mx.pizzacode.mapper.UsuarioMapper;
import mx.pizzacode.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPerfil(String correo) {
        return UsuarioMapper.toResponse(buscarPorCorreo(correo));
    }

    @Transactional
    public UsuarioResponseDTO actualizarPerfil(String correo, ActualizarPerfilRequestDTO dto) {
        Usuario usuario = buscarPorCorreo(correo);

        if (dto.getNombre() != null) {
            usuario.setNombre(dto.getNombre().trim());
        }
        if (dto.getApellidoPat() != null) {
            usuario.setApellidoPat(dto.getApellidoPat().trim());
        }
        if (dto.getApellidoMat() != null) {
            String apellidoMat = dto.getApellidoMat().trim();
            usuario.setApellidoMat(apellidoMat.isEmpty() ? null : apellidoMat);
        }
        if (dto.getTelefono() != null) {
            usuario.setTelefono(dto.getTelefono());
        }
        if (dto.getCanalTicket() != null) {
            usuario.setCanalTicket(dto.getCanalTicket());
        }

        return UsuarioMapper.toResponse(usuario);
    }

    private Usuario buscarPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new NoSuchElementException("El usuario no existe"));
    }
}