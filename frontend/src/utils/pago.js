// Estado del cobro: tarjeta se paga al pedir; efectivo se paga al entregar
export function estadoPago(pedido) {
  if (pedido.metodoPago === 'TARJETA') return 'Pagado'
  if (pedido.estado === 'ENTREGADO') return 'Pagado'
  if (pedido.estado === 'CANCELADO') return 'Sin cobro'
  return 'Pendiente'
}
