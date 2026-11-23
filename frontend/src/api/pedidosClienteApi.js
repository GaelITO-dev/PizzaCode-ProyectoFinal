import api from './axiosClient'

// CLIENTE: pedido en línea; el backend calcula el total con los precios de la BD
export async function crearPedidoEnLinea(pedido) {
  const { data } = await api.post('/pedidos', pedido)
  return data
}
