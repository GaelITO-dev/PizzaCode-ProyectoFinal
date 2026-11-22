package mx.pizzacode.service;

import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.ComentarioRequestDTO;
import mx.pizzacode.dto.ComentarioResponseDTO;
import mx.pizzacode.entity.Comentario;
import mx.pizzacode.entity.TipoComentario;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.mapper.ComentarioMapper;
import mx.pizzacode.repository.ComentarioRepository;
import mx.pizzacode.repository.UsuarioRepository;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final UsuarioRepository usuarioRepository;

    public ComentarioService(ComentarioRepository comentarioRepository, UsuarioRepository usuarioRepository) {
        this.comentarioRepository = comentarioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // del admin----------------------------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public Page<ComentarioResponseDTO> listar(TipoComentario tipo, Boolean visible, Pageable pageable) {
        return comentarioRepository.buscar(tipo, visible, null, pageable).map(ComentarioMapper::toResponse);
    }

    // Cualquiera autenticado: solo los visibles
    @Transactional(readOnly = true)
    public Page<ComentarioResponseDTO> listarPublicos(Pageable pageable) {
        return comentarioRepository.buscar(null, true, null, pageable).map(ComentarioMapper::toResponse);
    }

    // del cliente--------------------------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public Page<ComentarioResponseDTO> misComentarios(String correo, Pageable pageable) {
        return comentarioRepository.buscar(null, null, correo, pageable).map(ComentarioMapper::toResponse);
    }

    @Transactional
    public ComentarioResponseDTO crear(ComentarioRequestDTO dto, String correo) {
        Comentario comentario = new Comentario();
        comentario.setUsuario(usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ReglaNegocioException("No existe un usuario con el correo " + correo)));
        comentario.setTipo(dto.getTipo());
        comentario.setTexto(dto.getTexto().trim());
        return ComentarioMapper.toResponse(comentarioRepository.save(comentario));
    }

    // admin-----------------------------------------------------------------------------------------------
    @Transactional
    public ComentarioResponseDTO cambiarVisible(Integer id, boolean valor) {
        Comentario comentario = buscarPorId(id);
        comentario.setVisible(valor);
        return ComentarioMapper.toResponse(comentario);
    }

    @Transactional
    public void eliminar(Integer id) {
        comentarioRepository.delete(buscarPorId(id));
    }

    private Comentario buscarPorId(Integer id) {
        return comentarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el comentario con id " + id));
    }
}
