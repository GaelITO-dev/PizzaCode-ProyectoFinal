package mx.pizzacode.service;

import mx.pizzacode.dto.ClienteResumenDTO;
import mx.pizzacode.entity.EstadoUsuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    // El cajero no puede listar a todos los clientes: debe escribir algo para buscar
    private static final int MINIMO_BUSQUEDA = 2;

    private final UsuarioAdminService usuarioAdminService;

    public ClienteService(UsuarioAdminService usuarioAdminService) {
        this.usuarioAdminService = usuarioAdminService;
    }

    // Reutiliza la búsqueda de la gestión de usuarios, solo con clientes activos y menos datos
    @Transactional(readOnly = true)
    public Page<ClienteResumenDTO> buscar(String busqueda, Pageable pageable) {
        String texto = busqueda == null ? "" : busqueda.trim();
        if (texto.length() < MINIMO_BUSQUEDA) {
            return Page.empty(pageable);
        }

        return usuarioAdminService
                .listar(UsuarioAdminService.ROL_CLIENTE, EstadoUsuario.ACTIVO, texto, pageable)
                .map(u -> new ClienteResumenDTO(
                        u.getIdUsuario(),
                        u.getNombre(),
                        u.getApellidoPat(),
                        u.getApellidoMat(),
                        u.getCorreo(),
                        u.getTelefono()));
    }
}
