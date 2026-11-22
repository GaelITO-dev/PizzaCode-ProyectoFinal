package mx.pizzacode.service;

import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.CategoriaRequestDTO;
import mx.pizzacode.dto.CategoriaResponseDTO;
import mx.pizzacode.entity.Categoria;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.mapper.CategoriaMapper;
import mx.pizzacode.repository.CategoriaRepository;
import mx.pizzacode.repository.ProductoRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public Page<CategoriaResponseDTO> listar(String nombre, Pageable pageable) {
        if (nombre == null || nombre.isBlank()) {
            return categoriaRepository.findAll(pageable).map(CategoriaMapper::toResponse);
        }
        return categoriaRepository.findAllByNombreContainingIgnoreCase(nombre, pageable)
                .map(CategoriaMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CategoriaResponseDTO obtener(Integer id) {
        return categoriaRepository.findById(id)
                .map(CategoriaMapper::toResponse)
                .orElseThrow(() -> new NoSuchElementException("No se encontró la categoría con id " + id));
    }

    @Transactional
    public CategoriaResponseDTO crear(CategoriaRequestDTO dto) {
        String nombre = dto.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ReglaNegocioException("Ya existe una categoría con el nombre " + nombre);
        }
        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        return CategoriaMapper.toResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponseDTO actualizar(Integer id, CategoriaRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se encontró la categoría con id " + id));
        String nombre = dto.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdCategoriaNot(nombre, id)) {
            throw new ReglaNegocioException("Ya existe una categoría con el nombre " + nombre);
        }
        categoria.setNombre(nombre);
        return CategoriaMapper.toResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminar(Integer id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se encontró la categoría con id " + id));
        if (productoRepository.existsByCategoria_IdCategoria(id)) {
            throw new ReglaNegocioException("No se puede eliminar la categoría porque tiene productos asociados");
        }
        categoriaRepository.delete(categoria);
    }
}
