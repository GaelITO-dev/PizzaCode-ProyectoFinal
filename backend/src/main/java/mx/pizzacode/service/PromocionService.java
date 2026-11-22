package mx.pizzacode.service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.PromocionRequestDTO;
import mx.pizzacode.dto.PromocionResponseDTO;
import mx.pizzacode.entity.Producto;
import mx.pizzacode.entity.Promocion;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.mapper.PromocionMapper;
import mx.pizzacode.repository.ProductoRepository;
import mx.pizzacode.repository.PromocionRepository;

@Service
public class PromocionService {

    private final PromocionRepository promocionRepository;
    private final ProductoRepository productoRepository;

    public PromocionService(PromocionRepository promocionRepository, ProductoRepository productoRepository) {
        this.promocionRepository = promocionRepository;
        this.productoRepository = productoRepository;
    }

    // vigentes=true -> solo las activas hoy
    @Transactional(readOnly = true)
    public Page<PromocionResponseDTO> listar(String nombre, boolean vigentes, Pageable pageable) {
        String filtro = (nombre == null || nombre.isBlank()) ? null : nombre.trim();
        LocalDate hoy = vigentes ? LocalDate.now() : null;
        return promocionRepository.buscar(filtro, hoy, pageable).map(PromocionMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PromocionResponseDTO obtener(Integer id) {
        return PromocionMapper.toResponse(buscarPorId(id));
    }

    @Transactional
    public PromocionResponseDTO crear(PromocionRequestDTO dto) {
        Promocion promocion = new Promocion();
        copiarDatos(dto, promocion);
        return PromocionMapper.toResponse(promocionRepository.save(promocion));
    }

    @Transactional
    public PromocionResponseDTO actualizar(Integer id, PromocionRequestDTO dto) {
        Promocion promocion = buscarPorId(id);
        copiarDatos(dto, promocion);
        return PromocionMapper.toResponse(promocionRepository.save(promocion));
    }

    @Transactional
    public void eliminar(Integer id) {
        promocionRepository.delete(buscarPorId(id)); // JPA borra también sus filas en promocion_producto
    }

    private Promocion buscarPorId(Integer id) {
        return promocionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se encontró la promoción con id " + id));
    }

    private void copiarDatos(PromocionRequestDTO dto, Promocion promocion) {
        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new ReglaNegocioException("La fecha de fin no puede ser anterior a la de inicio");
        }
        List<Producto> productos = productoRepository.findAllById(dto.getIdsProductos());
        if (productos.size() != new HashSet<>(dto.getIdsProductos()).size()) {
            throw new ReglaNegocioException("Alguno de los productos seleccionados no existe");
        }
        promocion.setNombre(dto.getNombre().trim());
        promocion.setDescuento(dto.getDescuento());
        promocion.setFechaInicio(dto.getFechaInicio());
        promocion.setFechaFin(dto.getFechaFin());
        promocion.setProductos(new HashSet<>(productos));
    }
}