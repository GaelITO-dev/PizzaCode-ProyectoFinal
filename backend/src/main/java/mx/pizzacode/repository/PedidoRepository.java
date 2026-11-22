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

    // Modificación: Filtros opcionales: estado, rango de fechas, cliente con cuenta o teléfono.
    @EntityGraph(attributePaths = { "cliente", "cajero" })
    @Query("""
            SELECT p FROM Pedido p LEFT JOIN p.cliente c
            WHERE (:estado IS NULL OR p.estado = :estado)
              AND (:desde IS NULL OR p.fecha >= :desde)
              AND (:hasta IS NULL OR p.fecha < :hasta)
              AND (:idCliente IS NULL OR c.idUsuario = :idCliente)
              AND (:telefono IS NULL OR p.telefonoCliente = :telefono OR c.telefono = :telefono)
            """)
    Page<Pedido> buscar(EstadoPedido estado, LocalDateTime desde, LocalDateTime hasta,
                        Integer idCliente, String telefono, Pageable pageable);

}