package mx.pizzacode.controller;

import mx.pizzacode.dto.ClienteResumenDTO;
import mx.pizzacode.service.ClienteService;
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
@RequestMapping("/api/clientes")
@PreAuthorize("hasRole('CAJERO')")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<Page<ClienteResumenDTO>> buscar(
            @RequestParam(required = false) String busqueda,
            @PageableDefault(size = 5, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(clienteService.buscar(busqueda, pageable));
    }
}
