package mx.pizzacode.controller;

import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.service.CorreoService;

@RestController
@RequestMapping("/api/correo")
public class CorreoController {

    private static final Pattern FORMATO_CORREO = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final CorreoService correoService;

    public CorreoController(CorreoService correoService) {
        this.correoService = correoService;
    }

    // Solo ADMIN: manda un correo de prueba a "para" o, si no viene, al correo del admin que lo pide
    @PostMapping("/prueba")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> prueba(@RequestParam(required = false) String para,
                                                      Authentication auth) {
        String destino = (para == null || para.isBlank()) ? auth.getName() : para.trim();
        if (!FORMATO_CORREO.matcher(destino).matches()) {
            throw new ReglaNegocioException("El correo " + destino + " no es válido");
        }
        boolean enviado = correoService.enviarPrueba(destino);
        return ResponseEntity.ok(Map.of(
                "para", destino,
                "enviado", enviado,
                "configurado", correoService.estaConfigurado()));
    }
}
