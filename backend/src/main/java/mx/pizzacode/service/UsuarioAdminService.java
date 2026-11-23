package mx.pizzacode.service;

import mx.pizzacode.dto.BloqueoRequestDTO;
import mx.pizzacode.dto.EditarUsuarioRequestDTO;
import mx.pizzacode.dto.EmpleadoRequestDTO;
import mx.pizzacode.dto.ResumenUsuariosDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.entity.EstadoUsuario;
import mx.pizzacode.entity.Rol;
import mx.pizzacode.entity.Usuario;
import mx.pizzacode.exception.CorreoDuplicadoException;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.mapper.UsuarioMapper;
import mx.pizzacode.repository.RolRepository;
import mx.pizzacode.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class UsuarioAdminService {

    public static final String ROL_CLIENTE = "CLIENTE";
    public static final String ROL_CAJERO = "CAJERO";
    public static final String ROL_ADMIN = "ADMIN";

    private static final Set<String> ROLES_VALIDOS = Set.of(ROL_CLIENTE, ROL_CAJERO, ROL_ADMIN);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioAdminService(UsuarioRepository usuarioRepository,
                               RolRepository rolRepository,
                               PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponseDTO> listar(String rol, EstadoUsuario estado, String busqueda, Pageable pageable) {
        String rolFiltro = normalizarRol(rol);
        String texto = limpiar(busqueda);

        String patron = texto == null ? null : "%" + texto.toLowerCase(Locale.ROOT) + "%";

        String digitos = texto == null ? "" : texto.replaceAll("\\D", "");
        String patronTelefono = digitos.isEmpty() ? null : "%" + digitos + "%";

        return usuarioRepository.buscar(rolFiltro, estado, patron, patronTelefono, pageable)
                .map(UsuarioMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ResumenUsuariosDTO resumen() {
        return new ResumenUsuariosDTO(
                usuarioRepository.countByRol_Nombre(ROL_CLIENTE),
                usuarioRepository.countByRol_Nombre(ROL_CAJERO),
                usuarioRepository.countByRol_Nombre(ROL_ADMIN),
                usuarioRepository.countByEstado(EstadoUsuario.BLOQUEADO));
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtener(Integer idUsuario) {
        return UsuarioMapper.toResponse(buscarPorId(idUsuario));
    }

    @Transactional
    public UsuarioResponseDTO crearEmpleado(EmpleadoRequestDTO dto) {
        String correo = dto.getCorreo().trim().toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByCorreo(correo)) {
            throw new CorreoDuplicadoException("Ya existe un usuario con el correo " + correo);
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre().trim());
        usuario.setApellidoPat(dto.getApellidoPat().trim());
        usuario.setApellidoMat(limpiar(dto.getApellidoMat()));
        usuario.setCorreo(correo);
        usuario.setTelefono(dto.getTelefono().trim());
        usuario.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        usuario.setRol(buscarRol(dto.getRol()));
        usuario.setEstado(EstadoUsuario.ACTIVO);
        usuario.setMotivoBloqueo(null);

        return UsuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponseDTO editar(Integer idUsuario, EditarUsuarioRequestDTO dto, String correoAdmin) {
        Usuario usuario = buscarPorId(idUsuario);

        if (dto.getNombre() != null) {
            usuario.setNombre(dto.getNombre().trim());
        }
        if (dto.getApellidoPat() != null) {
            usuario.setApellidoPat(dto.getApellidoPat().trim());
        }
        if (dto.getApellidoMat() != null) {
            usuario.setApellidoMat(limpiar(dto.getApellidoMat()));
        }
        if (dto.getTelefono() != null) {
            usuario.setTelefono(dto.getTelefono().trim());
        }
        if (dto.getRol() != null) {
            cambiarRol(usuario, dto.getRol(), correoAdmin);
        }

        return UsuarioMapper.toResponse(usuario);
    }

    @Transactional
    public UsuarioResponseDTO bloquear(Integer idUsuario, BloqueoRequestDTO dto, String correoAdmin) {
        Usuario usuario = buscarPorId(idUsuario);

        if (usuario.getCorreo().equals(correoAdmin)) {
            throw new ReglaNegocioException("No puedes bloquear tu propia cuenta");
        }
        if (usuario.getEstado() == EstadoUsuario.BLOQUEADO) {
            throw new ReglaNegocioException("El usuario ya está bloqueado");
        }

        usuario.setEstado(EstadoUsuario.BLOQUEADO);
        usuario.setMotivoBloqueo(dto.getMotivo().trim());
        return UsuarioMapper.toResponse(usuario);
    }

    @Transactional
    public UsuarioResponseDTO desbloquear(Integer idUsuario) {
        Usuario usuario = buscarPorId(idUsuario);

        if (usuario.getEstado() != EstadoUsuario.BLOQUEADO) {
            throw new ReglaNegocioException("El usuario no está bloqueado");
        }

        usuario.setEstado(EstadoUsuario.ACTIVO);
        usuario.setMotivoBloqueo(null);
        return UsuarioMapper.toResponse(usuario);
    }

    private void cambiarRol(Usuario usuario, String rolNuevo, String correoAdmin) {
        String rolActual = usuario.getRol().getNombre();

        if (rolActual.equals(rolNuevo)) {
            return;
        }
        if (ROL_CLIENTE.equals(rolActual)) {
            throw new ReglaNegocioException("No se puede cambiar el rol de un cliente");
        }
        if (usuario.getCorreo().equals(correoAdmin)) {
            throw new ReglaNegocioException("No puedes cambiar tu propio rol");
        }

        usuario.setRol(buscarRol(rolNuevo));
    }

    private Usuario buscarPorId(Integer idUsuario) {
        return usuarioRepository.findConRolByIdUsuario(idUsuario)
                .orElseThrow(() -> new NoSuchElementException("El usuario no existe"));
    }

    private Rol buscarRol(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseThrow(() -> new IllegalStateException("El rol " + nombre + " no está configurado"));
    }

    private String normalizarRol(String rol) {
        String limpio = limpiar(rol);
        if (limpio == null) {
            return null;
        }
        String mayusculas = limpio.toUpperCase(Locale.ROOT);
        if (!ROLES_VALIDOS.contains(mayusculas)) {
            throw new ReglaNegocioException("El rol " + limpio + " no existe");
        }
        return mayusculas;
    }

    private String limpiar(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }
}
