package mx.pizzacode.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.pizzacode.entity.EstadoPedido;
import mx.pizzacode.entity.MetodoPago;
import mx.pizzacode.entity.OrigenPedido;
import mx.pizzacode.entity.Pedido;
import mx.pizzacode.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Query;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    @EntityGraph(attributePaths = { "cliente", "cajero" })
    Page<Pedido> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "cliente", "cajero" })
    Page<Pedido> findByEstado(EstadoPedido estado, Pageable pageable);

    @EntityGraph(attributePaths = { "cliente", "cajero" })
    Page<Pedido> findByOrigen(OrigenPedido origen, Pageable pageable);

    @EntityGraph(attributePaths = { "cliente", "cajero" })
    Page<Pedido> findByMetodoPago(MetodoPago metodoPago, Pageable pageable);

    @EntityGraph(attributePaths = { "cliente", "cajero" })
    Page<Pedido> findByCliente(Usuario cliente, Pageable pageable);

    // Filtros opcionales: estado, rango de fechas, cliente con cuenta, teléfono exacto,
    // origen, método de pago y búsqueda libre (folio exacto, parte del nombre o del teléfono).
    @EntityGraph(attributePaths = { "cliente", "cajero" })
    @Query("""
            SELECT p FROM Pedido p LEFT JOIN p.cliente c
            WHERE (:estado IS NULL OR p.estado = :estado)
              AND (:desde IS NULL OR p.fecha >= :desde)
              AND (:hasta IS NULL OR p.fecha < :hasta)
              AND (:idCliente IS NULL OR c.idUsuario = :idCliente)
              AND (:telefono IS NULL OR p.telefonoCliente = :telefono OR c.telefono = :telefono)
              AND (:origen IS NULL OR p.origen = :origen)
              AND (:metodoPago IS NULL OR p.metodoPago = :metodoPago)
              AND (:patronNombre IS NULL
                   OR p.idPedido = :folio
                   OR LOWER(p.nombreCliente) LIKE :patronNombre
                   OR LOWER(c.nombre) LIKE :patronNombre
                   OR p.telefonoCliente LIKE :patronTelefono
                   OR c.telefono LIKE :patronTelefono)
            """)
    Page<Pedido> buscar(EstadoPedido estado, LocalDateTime desde, LocalDateTime hasta,
                        Integer idCliente, String telefono, OrigenPedido origen, MetodoPago metodoPago,
                        String patronNombre, String patronTelefono, Integer folio, Pageable pageable);

    // Cliente (Mis pedidos): sus pedidos con ciertos estados; texto = folio exacto o parte del nombre de un producto
    @EntityGraph(attributePaths = { "cliente", "cajero" })
    @Query("""
            SELECT p FROM Pedido p
            WHERE p.cliente.idUsuario = :idCliente
              AND p.estado IN :estados
              AND (:texto IS NULL
                   OR CAST(p.idPedido AS String) = :texto
                   OR EXISTS (SELECT 1 FROM PedidoProducto pp
                              WHERE pp.pedido = p
                                AND LOWER(pp.producto.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))))
            """)
    Page<Pedido> buscarDelCliente(Integer idCliente, List<EstadoPedido> estados, String texto, Pageable pageable);

}