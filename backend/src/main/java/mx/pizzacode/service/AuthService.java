package mx.pizzacode.service;

import mx.pizzacode.dto.AuthResponseDTO;
import mx.pizzacode.dto.LoginRequestDTO;
import mx.pizzacode.dto.UsuarioRegistroDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.entity.EstadoUsuario;
import mx.pizzacode.entity.Rol;
import mx.pizzacode.entity.Usuario;
import mx.pizzacode.exception.CorreoDuplicadoException;
import mx.pizzacode.mapper.UsuarioMapper;
import mx.pizzacode.repository.RolRepository;
import mx.pizzacode.repository.UsuarioRepository;
import mx.pizzacode.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.NoSuchElementException;

@Service
public class AuthService {

    private static final String ROL_CLIENTE = "CLIENTE";

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioRepository usuarioRepository,
                       RolRepository rolRepository,
                       org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO dto) {
        String correo = dto.getCorreo().trim().toLowerCase(Locale.ROOT);

        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(correo, dto.getContrasena()));

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el usuario autenticado"));

        return new AuthResponseDTO(
                jwtService.generateToken(autenticacion),
                "Bearer",
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellidoPat(),
                usuario.getCorreo(),
                usuario.getRol().getNombre()
        );
    }

    @Transactional
    public UsuarioResponseDTO registrar(UsuarioRegistroDTO dto) {
        String correo = dto.getCorreo().trim().toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByCorreo(correo)) {
            throw new CorreoDuplicadoException("Ya existe un usuario con el correo " + correo);
        }

        Rol rol = rolRepository.findByNombre(ROL_CLIENTE)
                .orElseThrow(() -> new IllegalStateException("El rol CLIENTE no está configurado"));

        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre().trim());
        usuario.setApellidoPat(dto.getApellidoPat().trim());
        usuario.setApellidoMat(dto.getApellidoMat() == null ? null : dto.getApellidoMat().trim());
        usuario.setCorreo(correo);
        usuario.setTelefono(dto.getTelefono().trim());
        usuario.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        usuario.setRol(rol);
        usuario.setEstado(EstadoUsuario.ACTIVO);
        usuario.setMotivoBloqueo(null);

        return UsuarioMapper.toResponse(usuarioRepository.save(usuario));
    }
}
