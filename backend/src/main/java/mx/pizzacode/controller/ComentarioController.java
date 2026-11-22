package mx.pizzacode.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import mx.pizzacode.dto.ComentarioRequestDTO;
import mx.pizzacode.dto.ComentarioResponseDTO;
import mx.pizzacode.entity.TipoComentario;
import mx.pizzacode.service.ComentarioService;

@RestController
@RequestMapping("/api/comentarios")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ComentarioResponseDTO>> listar(
            @RequestParam(required = false) TipoComentario tipo,
            @RequestParam(required = false) Boolean visible,
            @PageableDefault(size = 10, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(comentarioService.listar(tipo, visible, pageable));
    }

    @GetMapping("/publicos")
    public ResponseEntity<Page<ComentarioResponseDTO>> listarPublicos(
            @PageableDefault(size = 10, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(comentarioService.listarPublicos(pageable));
    }

    @GetMapping("/mis-comentarios")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Page<ComentarioResponseDTO>> misComentarios(
            Authentication auth,
            @PageableDefault(size = 10, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(comentarioService.misComentarios(auth.getName(), pageable));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<ComentarioResponseDTO> crear(@Valid @RequestBody ComentarioRequestDTO dto,
                                                       Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(comentarioService.crear(dto, auth.getName()));
    }

    @PatchMapping("/{id}/visible")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComentarioResponseDTO> cambiarVisible(@PathVariable Integer id,
                                                                @RequestParam boolean valor) {
        return ResponseEntity.ok(comentarioService.cambiarVisible(id, valor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        comentarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
