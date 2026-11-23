package mx.pizzacode.service;

import mx.pizzacode.dto.ActualizarPerfilRequestDTO;
import mx.pizzacode.dto.CambiarContrasenaRequestDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.entity.Usuario;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.mapper.UsuarioMapper;
import mx.pizzacode.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
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

    @Transactional
    public void cambiarContrasena(String correo, CambiarContrasenaRequestDTO dto) {
        Usuario usuario = buscarPorCorreo(correo);

        if (!passwordEncoder.matches(dto.getContrasenaActual(), usuario.getContrasena())) {
            throw new ReglaNegocioException("La contraseña actual es incorrecta");
        }
        if (passwordEncoder.matches(dto.getContrasenaNueva(), usuario.getContrasena())) {
            throw new ReglaNegocioException("La nueva contraseña debe ser diferente a la actual");
        }

        usuario.setContrasena(passwordEncoder.encode(dto.getContrasenaNueva()));
    }

    private Usuario buscarPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new NoSuchElementException("El usuario no existe"));
    }
}