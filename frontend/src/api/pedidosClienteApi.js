import api from './axiosClient'

// CLIENTE: pedido en línea; el backend calcula el total con los precios de la BD
export async function crearPedidoEnLinea(pedido) {
  const { data } = await api.post('/pedidos', pedido)
  return data
}

// CLIENTE: detalle de UN pedido suyo (si no es suyo, el backend responde 404)
export async function obtenerMiPedido(id) {
  const { data } = await api.get(`/pedidos/mis-pedidos/${id}`)
  return data
}

// CLIENTE: sus pedidos. params: filtro (EN_CURSO, ENTREGADO, CANCELADO), buscar (folio o producto), page, size
export async function listarMisPedidos(params) {
  const { data } = await api.get('/pedidos/mis-pedidos', { params })
  return data
}
