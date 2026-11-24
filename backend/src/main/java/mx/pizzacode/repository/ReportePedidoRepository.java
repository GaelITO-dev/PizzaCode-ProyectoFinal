package mx.pizzacode.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import mx.pizzacode.entity.EstadoPedido;
import mx.pizzacode.entity.Pedido;

// Consultas de solo lectura para reportes: la base de datos hace las sumas y agrupaciones
public interface ReportePedidoRepository extends Repository<Pedido, Integer> {

    @Query("""
            SELECT COUNT(p), SUM(p.total) FROM Pedido p
            WHERE p.fecha >= :inicio AND p.fecha < :fin AND p.estado <> :excluido
            """)
    List<Object[]> totalesSinEstado(@Param("inicio") LocalDateTime inicio,
                                    @Param("fin") LocalDateTime fin,
                                    @Param("excluido") EstadoPedido excluido);

    @Query("""
            SELECT COUNT(p), SUM(p.total) FROM Pedido p
            WHERE p.fecha >= :inicio AND p.fecha < :fin AND p.estado = :estado
            """)
    List<Object[]> totalesConEstado(@Param("inicio") LocalDateTime inicio,
                                    @Param("fin") LocalDateTime fin,
                                    @Param("estado") EstadoPedido estado);

    @Query("""
            SELECT p.origen, COUNT(p), SUM(p.total) FROM Pedido p
            WHERE p.fecha >= :inicio AND p.fecha < :fin AND p.estado <> :excluido
            GROUP BY p.origen
            ORDER BY SUM(p.total) DESC
            """)
    List<Object[]> ventasPorOrigen(@Param("inicio") LocalDateTime inicio,
                                   @Param("fin") LocalDateTime fin,
                                   @Param("excluido") EstadoPedido excluido);

    @Query("""
            SELECT p.metodoPago, COUNT(p), SUM(p.total) FROM Pedido p
            WHERE p.fecha >= :inicio AND p.fecha < :fin AND p.estado <> :excluido
            GROUP BY p.metodoPago
            ORDER BY SUM(p.total) DESC
            """)
    List<Object[]> ventasPorMetodoPago(@Param("inicio") LocalDateTime inicio,
                                       @Param("fin") LocalDateTime fin,
                                       @Param("excluido") EstadoPedido excluido);

    // Usa el precio con el que se vendió (precio_unitario), no el precio actual del producto
    @Query("""
            SELECT pr.idProducto, pr.nombre, SUM(pp.cantidad), SUM(pp.cantidad * pp.precioUnitario)
            FROM PedidoProducto pp JOIN pp.pedido p JOIN pp.producto pr
            WHERE p.fecha >= :inicio AND p.fecha < :fin AND p.estado <> :excluido
            GROUP BY pr.idProducto, pr.nombre
            ORDER BY SUM(pp.cantidad * pp.precioUnitario) DESC
            """)
    List<Object[]> masVendidos(@Param("inicio") LocalDateTime inicio,
                               @Param("fin") LocalDateTime fin,
                               @Param("excluido") EstadoPedido excluido,
                               Pageable pagina);

    // Agrupar por día y por hora necesita funciones de MySQL, por eso estas dos son SQL nativo
    @Query(value = """
            SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS clave, COUNT(*) AS pedidos, SUM(total) AS total
            FROM pedidos
            WHERE fecha >= :inicio AND fecha < :fin AND estado <> 'CANCELADO'
            GROUP BY clave
            ORDER BY clave
            """, nativeQuery = true)
    List<Object[]> ventasPorDia(@Param("inicio") LocalDateTime inicio,
                                @Param("fin") LocalDateTime fin);

    @Query(value = """
            SELECT DATE_FORMAT(fecha, '%H') AS clave, COUNT(*) AS pedidos, SUM(total) AS total
            FROM pedidos
            WHERE fecha >= :inicio AND fecha < :fin AND estado <> 'CANCELADO'
            GROUP BY clave
            ORDER BY clave
            """, nativeQuery = true)
    List<Object[]> ventasPorHora(@Param("inicio") LocalDateTime inicio,
                                 @Param("fin") LocalDateTime fin);
}
