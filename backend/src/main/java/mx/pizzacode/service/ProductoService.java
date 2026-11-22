package mx.pizzacode.service;

import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mx.pizzacode.dto.ProductoRequestDTO;
import mx.pizzacode.dto.ProductoResponseDTO;
import mx.pizzacode.entity.Producto;
import mx.pizzacode.exception.ReglaNegocioException;
import mx.pizzacode.mapper.ProductoMapper;
import mx.pizzacode.repository.CategoriaRepository;
import mx.pizzacode.repository.PedidoProductoRepository;
import mx.pizzacode.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final PedidoProductoRepository pedidoProductoRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository,
                           PedidoProductoRepository pedidoProductoRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.pedidoProductoRepository = pedidoProductoRepository;
    }

    // Menú público: solo productos disponibles
    @Transactional(readOnly = true)
    public Page<ProductoResponseDTO> listarMenu(String nombre, Integer idCategoria, Pageable pageable) {
        return productoRepository.buscar(limpiar(nombre), idCategoria, true, pageable)
                .map(ProductoMapper::toResponse);
    }

    // Gestión (ADMIN): todos, con filtro opcional de disponible
    @Transactional(readOnly = true)
    public Page<ProductoResponseDTO> listarGestion(String nombre, Integer idCategoria, Boolean disponible,
                                                   Pageable pageable) {
        return productoRepository.buscar(limpiar(nombre), idCategoria, disponible, pageable)
                .map(ProductoMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductoResponseDTO obtener(Integer id) {
        return ProductoMapper.toResponse(buscarPorId(id));
    }

    @Transactional
    public ProductoResponseDTO crear(ProductoRequestDTO dto) {
        Producto producto = new Producto();
        copiarDatos(dto, producto);
        return ProductoMapper.toResponse(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponseDTO actualizar(Integer id, ProductoRequestDTO dto) {
        Producto producto = buscarPorId(id);
        copiarDatos(dto, producto);
        return ProductoMapper.toResponse(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponseDTO cambiarDisponible(Integer id, boolean valor) {
        Producto producto = buscarPorId(id);
        producto.setDisponible(valor);
        return ProductoMapper.toResponse(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Integer id) {
        Producto producto = buscarPorId(id);
        if (pedidoProductoRepository.existsByProducto_IdProducto(id)) {
            throw new ReglaNegocioException(
                    "No se puede eliminar el producto porque ya está en pedidos; desactívalo en su lugar");
        }
        productoRepository.delete(producto);
    }

    private Producto buscarPorId(Integer id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el producto con id " + id));
    }

    private void copiarDatos(ProductoRequestDTO dto, Producto producto) {
        producto.setNombre(dto.getNombre().trim());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setImagen(dto.getImagen());
        if (dto.getDisponible() != null) {
            producto.setDisponible(dto.getDisponible());
        }
        producto.setCategoria(categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new ReglaNegocioException(
                        "La categoría con id " + dto.getIdCategoria() + " no existe")));
    }

    // "" o "   " cuenta como "sin filtro"
    private String limpiar(String texto) {
        return (texto == null || texto.isBlank()) ? null : texto.trim();
    }
}