package mx.pizzacode.controller;

import java.time.LocalDate;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import mx.pizzacode.dto.PedidoCancelacionRequestDTO;
import mx.pizzacode.dto.PedidoEstadoRequestDTO;
import mx.pizzacode.dto.PedidoRequestDTO;
import mx.pizzacode.dto.PedidoResponseDTO;
import mx.pizzacode.dto.PedidoResumenResponseDTO;
import mx.pizzacode.entity.EstadoPedido;
import mx.pizzacode.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // ----- Para el cajero o el admin -----

    @GetMapping("")
    @PreAuthorize("hasRole('CAJERO')")
    public ResponseEntity<Page<PedidoResumenResponseDTO>> listar(
            @RequestParam(required = false) EstadoPedido estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Integer idCliente,
            @RequestParam(required = false) String telefono,
            @PageableDefault(size = 10, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(pedidoService.listar(estado, desde, hasta, idCliente, telefono, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CAJERO')")
    public ResponseEntity<PedidoResponseDTO> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(pedidoService.obtener(id));
    }

    @PostMapping("/sucursal")
    @PreAuthorize("hasRole('CAJERO')")
    public ResponseEntity<PedidoResponseDTO> crearEnSucursal(@Valid @RequestBody PedidoRequestDTO dto,
                                                             Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crearEnSucursal(dto, auth.getName()));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('CAJERO')")
    public ResponseEntity<PedidoResumenResponseDTO> cambiarEstado(@PathVariable Integer id,
                                                                 @Valid @RequestBody PedidoEstadoRequestDTO dto) {
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, dto.getEstado()));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('CAJERO')")
    public ResponseEntity<PedidoResumenResponseDTO> cancelar(@PathVariable Integer id,
                                                            @Valid @RequestBody PedidoCancelacionRequestDTO dto) {
        return ResponseEntity.ok(pedidoService.cancelar(id, dto.getMotivo()));
    }

    // ----- Cliente, le pide autorización -----

    @PostMapping("")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<PedidoResponseDTO> crearEnLinea(@Valid @RequestBody PedidoRequestDTO dto,
                                                          Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crearEnLinea(dto, auth.getName()));
    }

    @GetMapping("/mis-pedidos")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Page<PedidoResumenResponseDTO>> misPedidos(
            Authentication auth,
            @PageableDefault(size = 10, sort = "fecha", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(pedidoService.misPedidos(auth.getName(), pageable));
    }

    @GetMapping("/mis-pedidos/{id}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<PedidoResponseDTO> obtenerMio(@PathVariable Integer id, Authentication auth) {
        return ResponseEntity.ok(pedidoService.obtenerMio(id, auth.getName()));
    }
}