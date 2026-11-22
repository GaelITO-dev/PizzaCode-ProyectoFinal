package mx.pizzacode.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.pizzacode.entity.Pedido;
import mx.pizzacode.entity.PedidoProducto;
import mx.pizzacode.entity.PedidoProductoId;
import mx.pizzacode.entity.Producto;

public interface PedidoProductoRepository extends JpaRepository<PedidoProducto, PedidoProductoId> {

    Page<PedidoProducto> findByPedido(Pedido pedido, Pageable pageable);

    Page<PedidoProducto> findByProducto(Producto producto, Pageable pageable);
}
