import api from './axiosClient'

export async function crearPedidoSucursal(pedido) {
  const { data } = await api.post('/pedidos/sucursal', pedido)
  return data
}

export async function listarPedidos(params) {
  const { data } = await api.get('/pedidos', { params })
  return data
}

export async function cambiarEstadoPedido(idPedido, estado) {
  const { data } = await api.patch(`/pedidos/${idPedido}/estado`, { estado })
  return data
}

export async function cancelarPedido(idPedido, motivo) {
  const { data } = await api.patch(`/pedidos/${idPedido}/cancelar`, { motivo })
  return data
}
