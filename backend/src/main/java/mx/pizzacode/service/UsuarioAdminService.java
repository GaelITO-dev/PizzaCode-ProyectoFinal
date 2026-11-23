package mx.pizzacode.service;

import mx.pizzacode.dto.ResumenUsuariosDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.entity.EstadoUsuario;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.mapper.UsuarioMapper;
import mx.pizzacode.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
public class UsuarioAdminService {

    public static final String ROL_CLIENTE = "CLIENTE";
    public static final String ROL_CAJERO = "CAJERO";
    public static final String ROL_ADMIN = "ADMIN";

    private static final Set<String> ROLES_VALIDOS = Set.of(ROL_CLIENTE, ROL_CAJERO, ROL_ADMIN);

    private final UsuarioRepository usuarioRepository;

    public UsuarioAdminService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
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
