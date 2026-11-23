package mx.pizzacode.service;

import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.LikeResponseDTO;
import mx.pizzacode.entity.Comentario;
import mx.pizzacode.entity.ComentarioLike;
import mx.pizzacode.entity.ComentarioLikeId;
import mx.pizzacode.entity.Usuario;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.repository.ComentarioLikeRepository;
import mx.pizzacode.repository.ComentarioRepository;
import mx.pizzacode.repository.UsuarioRepository;

@Service
public class ComentarioLikeService {

    private final ComentarioLikeRepository likeRepository;
    private final ComentarioRepository comentarioRepository;
    private final UsuarioRepository usuarioRepository;

    public ComentarioLikeService(ComentarioLikeRepository likeRepository,
                                 ComentarioRepository comentarioRepository,
                                 UsuarioRepository usuarioRepository) {
        this.likeRepository = likeRepository;
        this.comentarioRepository = comentarioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public LikeResponseDTO darLike(Integer idComentario, String correo) {
        Comentario comentario = buscarComentarioVisible(idComentario);
        Usuario usuario = buscarUsuario(correo);
        ComentarioLikeId id = new ComentarioLikeId(idComentario, usuario.getIdUsuario());

        // Si ya le había dado like, no hace nada (no truena)
        if (!likeRepository.existsById(id)) {
            ComentarioLike like = new ComentarioLike();
            like.setComentario(comentario);
            like.setUsuario(usuario);
            likeRepository.save(like);
        }
        return new LikeResponseDTO(idComentario, likeRepository.countByIdIdComentario(idComentario), true);
    }

    @Transactional
    public LikeResponseDTO quitarLike(Integer idComentario, String correo) {
        buscarComentarioVisible(idComentario);
        Usuario usuario = buscarUsuario(correo);
        ComentarioLikeId id = new ComentarioLikeId(idComentario, usuario.getIdUsuario());

        // Si no había like, tampoco truena
        if (likeRepository.existsById(id)) {
            likeRepository.deleteById(id);
        }
        return new LikeResponseDTO(idComentario, likeRepository.countByIdIdComentario(idComentario), false);
    }

    private Comentario buscarComentarioVisible(Integer id) {
        Comentario comentario = comentarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el comentario con id " + id));
        if (!comentario.getVisible()) {
            throw new ReglaNegocioException("No se puede reaccionar a un comentario oculto");
        }
        return comentario;
    }

    private Usuario buscarUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ReglaNegocioException("No existe un usuario con el correo " + correo));
    }
}