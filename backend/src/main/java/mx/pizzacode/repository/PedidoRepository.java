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

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    @EntityGraph(attributePaths = { "cliente", "cajero" })
    Page<Pedido> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "cliente", "cajero" })
    Page<Pedido> findByEstado(EstadoPedido estado, Pageable pageable);

    Page<Pedido> findByOrigen(OrigenPedido origen, Pageable pageable);

    Page<Pedido> findByMetodoPago(MetodoPago metodoPago, Pageable pageable);

    Page<Pedido> findByCliente(Usuario cliente, Pageable pageable);
}
