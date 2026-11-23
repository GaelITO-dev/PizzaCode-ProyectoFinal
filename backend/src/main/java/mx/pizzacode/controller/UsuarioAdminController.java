package mx.pizzacode.controller;

import mx.pizzacode.dto.ResumenUsuariosDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.entity.EstadoUsuario;
import mx.pizzacode.service.UsuarioAdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
}
