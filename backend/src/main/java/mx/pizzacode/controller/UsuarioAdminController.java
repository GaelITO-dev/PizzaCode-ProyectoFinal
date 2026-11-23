package mx.pizzacode.controller;

import jakarta.validation.Valid;
import mx.pizzacode.dto.BloqueoRequestDTO;
import mx.pizzacode.dto.EditarUsuarioRequestDTO;
import mx.pizzacode.dto.EmpleadoRequestDTO;
import mx.pizzacode.dto.ResumenUsuariosDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.entity.EstadoUsuario;
import mx.pizzacode.service.UsuarioAdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioAdminController {

    private final UsuarioAdminService usuarioAdminService;

    public UsuarioAdminController(UsuarioAdminService usuarioAdminService) {
        this.usuarioAdminService = usuarioAdminService;
    }

    @GetMapping
    public ResponseEntity<Page<UsuarioResponseDTO>> listar(
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) EstadoUsuario estado,
            @RequestParam(required = false) String busqueda,
            @PageableDefault(size = 8, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(usuarioAdminService.listar(rol, estado, busqueda, pageable));
    }

    @GetMapping("/resumen")
    public ResumenUsuariosDTO resumen() {
        return usuarioAdminService.resumen();
    }

    @GetMapping("/{id:\\d+}")
    public UsuarioResponseDTO obtener(@PathVariable("id") Integer id) {
        return usuarioAdminService.obtener(id);
    }

    @PostMapping("/empleados")
    public ResponseEntity<UsuarioResponseDTO> crearEmpleado(@Valid @RequestBody EmpleadoRequestDTO dto) {
        UsuarioResponseDTO creado = usuarioAdminService.crearEmpleado(dto);
        return ResponseEntity.created(URI.create("/api/usuarios/" + creado.getIdUsuario())).body(creado);
    }

    @PatchMapping("/{id:\\d+}")
    public UsuarioResponseDTO editar(@PathVariable("id") Integer id,
                                     @Valid @RequestBody EditarUsuarioRequestDTO dto,
                                     @AuthenticationPrincipal UserDetails admin) {
        return usuarioAdminService.editar(id, dto, admin.getUsername());
    }

    @PatchMapping("/{id:\\d+}/bloqueo")
    public UsuarioResponseDTO bloquear(@PathVariable("id") Integer id,
                                       @Valid @RequestBody BloqueoRequestDTO dto,
                                       @AuthenticationPrincipal UserDetails admin) {
        return usuarioAdminService.bloquear(id, dto, admin.getUsername());
    }

    @PatchMapping("/{id:\\d+}/desbloqueo")
    public UsuarioResponseDTO desbloquear(@PathVariable("id") Integer id) {
        return usuarioAdminService.desbloquear(id);
    }
}
