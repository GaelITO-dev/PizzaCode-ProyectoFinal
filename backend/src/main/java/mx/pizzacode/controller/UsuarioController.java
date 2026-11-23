package mx.pizzacode.controller;

import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.service.UsuarioService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
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
}