package mx.pizzacode.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import mx.pizzacode.dto.PromocionRequestDTO;
import mx.pizzacode.dto.PromocionResponseDTO;
import mx.pizzacode.entity.EstadoPromocion;
import mx.pizzacode.service.PromocionService;

@RestController
@RequestMapping("/api/promociones")
public class PromocionController {

    private final PromocionService promocionService;

    public PromocionController(PromocionService promocionService) {
        this.promocionService = promocionService;
    }


    @GetMapping("")
    public ResponseEntity<Page<PromocionResponseDTO>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) EstadoPromocion estado,
            @RequestParam(defaultValue = "false") boolean vigentes, // atajo: igual a estado=VIGENTE
            @PageableDefault(size = 10, sort = "fechaInicio") Pageable pageable) {
        EstadoPromocion filtro = (estado == null && vigentes) ? EstadoPromocion.VIGENTE : estado;
        return ResponseEntity.ok(promocionService.listar(nombre, filtro, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromocionResponseDTO> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(promocionService.obtener(id));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromocionResponseDTO> crear(@Valid @RequestBody PromocionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promocionService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromocionResponseDTO> actualizar(@PathVariable Integer id,
                                                           @Valid @RequestBody PromocionRequestDTO dto) {
        return ResponseEntity.ok(promocionService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        promocionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}