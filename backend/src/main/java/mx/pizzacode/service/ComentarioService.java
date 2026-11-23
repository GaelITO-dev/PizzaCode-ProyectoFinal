package mx.pizzacode.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

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
import mx.pizzacode.repository.ComentarioLikeRepository;
import mx.pizzacode.repository.ComentarioRepository;
import mx.pizzacode.repository.ConteoLikes;
import mx.pizzacode.repository.UsuarioRepository;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final ComentarioLikeRepository likeRepository;

    public ComentarioService(ComentarioRepository comentarioRepository,
                             UsuarioRepository usuarioRepository,
                             ComentarioLikeRepository likeRepository) {
        this.comentarioRepository = comentarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.likeRepository = likeRepository;
    }

    // del admin----------------------------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public Page<ComentarioResponseDTO> listar(TipoComentario tipo, Boolean visible, Pageable pageable) {
        return comentarioRepository.buscar(tipo, visible, null, pageable).map(ComentarioMapper::toResponse);
    }

    // Cualquiera autenticado: solo los visibles, con su total de likes y si el usuario actual dio like.
    // Siempre son 3 consultas por página (comentarios, conteos y mis likes), sin N+1.
    @Transactional(readOnly = true)
    public Page<ComentarioResponseDTO> listarPublicos(String correo, Pageable pageable) {
        Page<Comentario> pagina = comentarioRepository.buscar(null, true, null, pageable);
        List<Integer> ids = pagina.getContent().stream()
                .map(Comentario::getIdComentario)
                .toList();

        Map<Integer, Long> conteos = ids.isEmpty() ? Map.of()
                : likeRepository.contarPorComentarios(ids).stream()
                        .collect(Collectors.toMap(ConteoLikes::getIdComentario, ConteoLikes::getTotal));

        Set<Integer> conMiLike = ids.isEmpty() ? Set.of()
                : new HashSet<>(likeRepository.idsConLikeDelUsuario(correo, ids));

        return pagina.map(c -> {
            ComentarioResponseDTO dto = ComentarioMapper.toResponse(c);
            dto.setTotalLikes(conteos.getOrDefault(c.getIdComentario(), 0L));
            dto.setYaDioLike(conMiLike.contains(c.getIdComentario()));
            return dto;
        });
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