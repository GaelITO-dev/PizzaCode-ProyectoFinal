package mx.pizzacode.controller;

import java.util.Map;

import jakarta.validation.Valid;
import mx.pizzacode.dto.AuthResponseDTO;
import mx.pizzacode.dto.LoginRequestDTO;
import mx.pizzacode.dto.RecuperarContrasenaRequestDTO;
import mx.pizzacode.dto.RestablecerContrasenaRequestDTO;
import mx.pizzacode.dto.UsuarioRegistroDTO;
import mx.pizzacode.dto.UsuarioResponseDTO;
import mx.pizzacode.service.AuthService;
import mx.pizzacode.service.RecuperacionContrasenaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String MENSAJE_RECUPERACION =
            "Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña";

    private final AuthService authService;
    private final RecuperacionContrasenaService recuperacionService;

    public AuthController(AuthService authService, RecuperacionContrasenaService recuperacionService) {
        this.authService = authService;
        this.recuperacionService = recuperacionService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponseDTO> registro(@Valid @RequestBody UsuarioRegistroDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registrar(dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(HttpHeaders.AUTHORIZATION) String autorizacion) {
        authService.logout(autorizacion.substring("Bearer ".length()));
        return ResponseEntity.noContent().build();
    }

    // Siempre responde lo mismo, exista o no el correo
    @PostMapping("/recuperar")
    public ResponseEntity<Map<String, String>> recuperar(@Valid @RequestBody RecuperarContrasenaRequestDTO dto) {
        recuperacionService.solicitar(dto.getCorreo());
        return ResponseEntity.ok(Map.of("message", MENSAJE_RECUPERACION));
    }

    @PostMapping("/restablecer")
    public ResponseEntity<AuthResponseDTO> restablecer(@Valid @RequestBody RestablecerContrasenaRequestDTO dto) {
        return ResponseEntity.ok(recuperacionService.restablecer(dto.getToken(), dto.getNuevaContrasena()));
    }
}
