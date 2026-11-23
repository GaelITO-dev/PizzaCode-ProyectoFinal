package mx.pizzacode.service;

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

    private Usuario buscarPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new NoSuchElementException("El usuario no existe"));
    }
}