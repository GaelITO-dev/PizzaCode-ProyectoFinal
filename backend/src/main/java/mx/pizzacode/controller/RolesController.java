package mx.pizzacode.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoints de verificación de seguridad por método.
 * Gracias a la jerarquía, ADMIN también accede a /cajero y /cliente,
 * y CAJERO también accede a /cliente.
 */
@RestController
@RequestMapping("/api/roles")
public class RolesController {

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> admin() {
        return respuesta("ADMIN");
    }

    @GetMapping("/cajero")
    @PreAuthorize("hasRole('CAJERO')")
    public Map<String, String> cajero() {
        return respuesta("CAJERO");
    }

    @GetMapping("/cliente")
    @PreAuthorize("hasRole('CLIENTE')")
    public Map<String, String> cliente() {
        return respuesta("CLIENTE");
    }

    private Map<String, String> respuesta(String rol) {
        return Map.of(
                "rol", rol,
                "mensaje", "Acceso concedido para " + rol
        );
    }
}
