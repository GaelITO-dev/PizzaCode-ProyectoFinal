package mx.pizzacode.controller;

import mx.pizzacode.dto.ActualizarPerfilRequestDTO;
import mx.pizzacode.dto.CambiarContrasenaRequestDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/me")
    public UsuarioResponseDTO miPerfil(@AuthenticationPrincipal UserDetails usuarioActual) {
        return usuarioService.obtenerPerfil(usuarioActual.getUsername());
    }

    @PatchMapping("/me")
    public UsuarioResponseDTO actualizarMiPerfil(@AuthenticationPrincipal UserDetails usuarioActual,
                                                 @Valid @RequestBody ActualizarPerfilRequestDTO dto) {
        return usuarioService.actualizarPerfil(usuarioActual.getUsername(), dto);
    }

    @PutMapping("/me/contrasena")
    public ResponseEntity<Void> cambiarMiContrasena(
            @AuthenticationPrincipal UserDetails usuarioActual,
            @Valid @RequestBody CambiarContrasenaRequestDTO dto) {
        usuarioService.cambiarContrasena(usuarioActual.getUsername(), dto);
        return ResponseEntity.noContent().build();
    }
}
