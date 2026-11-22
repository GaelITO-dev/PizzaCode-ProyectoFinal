package mx.pizzacode.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import mx.pizzacode.dto.ProductoRequestDTO;
import mx.pizzacode.dto.ProductoResponseDTO;
import mx.pizzacode.service.ProductoService;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping("")
    public ResponseEntity<Page<ProductoResponseDTO>> listarMenu(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Integer idCategoria,
            @PageableDefault(size = 10, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(productoService.listarMenu(nombre, idCategoria, pageable));
    }

    @GetMapping("/gestion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ProductoResponseDTO>> listarGestion(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Integer idCategoria,
            @RequestParam(required = false) Boolean disponible,
            @PageableDefault(size = 10, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(productoService.listarGestion(nombre, idCategoria, disponible, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.obtener(id));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponseDTO> crear(@Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponseDTO> actualizar(@PathVariable Integer id,
                                                          @Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(productoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/disponible")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponseDTO> cambiarDisponible(@PathVariable Integer id,
                                                                 @RequestParam boolean valor) {
        return ResponseEntity.ok(productoService.cambiarDisponible(id, valor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}