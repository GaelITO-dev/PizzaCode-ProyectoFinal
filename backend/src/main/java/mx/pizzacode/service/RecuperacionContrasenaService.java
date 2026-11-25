package mx.pizzacode.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.AuthResponseDTO;
import mx.pizzacode.entity.EstadoUsuario;
import mx.pizzacode.entity.RecuperacionContrasena;
import mx.pizzacode.entity.Usuario;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.repository.RecuperacionContrasenaRepository;
import mx.pizzacode.repository.UsuarioRepository;
import mx.pizzacode.security.JwtService;

@Service
public class RecuperacionContrasenaService {

    private static final Logger log = LoggerFactory.getLogger(RecuperacionContrasenaService.class);

    public static final int MINUTOS_VALIDEZ = 30;
    private static final int SEGUNDOS_ENTRE_ENVIOS = 60;
    private static final String ENLACE_INVALIDO = "El enlace no es válido o ya venció. Pide uno nuevo.";

    private final SecureRandom aleatorio = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final RecuperacionContrasenaRepository recuperacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final CorreoService correoService;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    public RecuperacionContrasenaService(UsuarioRepository usuarioRepository,
                                         RecuperacionContrasenaRepository recuperacionRepository,
                                         PasswordEncoder passwordEncoder,
                                         CorreoService correoService,
                                         UserDetailsService userDetailsService,
                                         JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.recuperacionRepository = recuperacionRepository;
        this.passwordEncoder = passwordEncoder;
        this.correoService = correoService;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    // No lanza errores por el correo: el controlador siempre responde lo mismo (no revela qué cuentas existen)
    @Transactional
    public void solicitar(String correoIngresado) {
        String correo = correoIngresado.trim().toLowerCase(Locale.ROOT);
        Optional<Usuario> encontrado = usuarioRepository.findByCorreo(correo);

        if (encontrado.isEmpty()) {
            log.info("Recuperación pedida para un correo no registrado");
            return;
        }
        Usuario usuario = encontrado.get();
        if (usuario.getEstado() == EstadoUsuario.BLOQUEADO) {
            log.info("Recuperación pedida para una cuenta bloqueada (id {})", usuario.getIdUsuario());
            return;
        }

        LocalDateTime ahora = LocalDateTime.now();
        if (recuperacionRepository.existsByUsuario_IdUsuarioAndFechaCreacionAfter(
                usuario.getIdUsuario(), ahora.minusSeconds(SEGUNDOS_ENTRE_ENVIOS))) {
            log.info("Recuperación ignorada: el usuario {} pidió otra hace menos de {} s",
                    usuario.getIdUsuario(), SEGUNDOS_ENTRE_ENVIOS);
            return;
        }

        // Solo el enlace más reciente sirve
        recuperacionRepository.invalidarVigentes(usuario.getIdUsuario(), ahora);

        String token = generarToken();
        RecuperacionContrasena recuperacion = new RecuperacionContrasena();
        recuperacion.setUsuario(usuario);
        recuperacion.setTokenHash(hash(token));
        recuperacion.setFechaCreacion(ahora);
        recuperacion.setFechaExpiracion(ahora.plusMinutes(MINUTOS_VALIDEZ));
        recuperacionRepository.save(recuperacion);

        String enlace = correoService.getUrlFrontend() + "/restablecer?token=" + token;
        correoService.enviarRecuperacion(usuario.getCorreo(), usuario.getNombre(), enlace, MINUTOS_VALIDEZ);
    }

    // Cambia la contraseña y devuelve una sesión nueva ("Guardar y entrar")
    @Transactional
    public AuthResponseDTO restablecer(String token, String nuevaContrasena) {
        RecuperacionContrasena recuperacion = recuperacionRepository.findByTokenHash(hash(token))
                .orElseThrow(() -> new ReglaNegocioException(ENLACE_INVALIDO));

        LocalDateTime ahora = LocalDateTime.now();
        Usuario usuario = recuperacion.getUsuario();

        if (recuperacion.getFechaUso() != null
                || recuperacion.getFechaExpiracion().isBefore(ahora)
                || usuario.getEstado() == EstadoUsuario.BLOQUEADO) {
            throw new ReglaNegocioException(ENLACE_INVALIDO);
        }
        if (passwordEncoder.matches(nuevaContrasena, usuario.getContrasena())) {
            throw new ReglaNegocioException("La nueva contraseña debe ser diferente a la actual");
        }

        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        // Marca este enlace (y cualquier otro vigente) como usado
        recuperacionRepository.invalidarVigentes(usuario.getIdUsuario(), ahora);

        UserDetails detalles = userDetailsService.loadUserByUsername(usuario.getCorreo());
        String jwt = jwtService.generateToken(
                new UsernamePasswordAuthenticationToken(detalles, null, detalles.getAuthorities()));

        return new AuthResponseDTO(
                jwt,
                "Bearer",
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getApellidoPat(),
                usuario.getCorreo(),
                usuario.getRol().getNombre());
    }

    // 32 bytes aleatorios (256 bits) en Base64 URL: se puede poner en un enlace sin escapar
    private String generarToken() {
        byte[] bytes = new byte[32];
        aleatorio.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // SHA-256 y no BCrypt: el token ya es aleatorio (no se puede adivinar) y hay que buscarlo por su hash
    private static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no está disponible", e);
        }
    }
}
