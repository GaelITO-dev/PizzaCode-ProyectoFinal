import api from './axiosClient'

export async function crearPedidoSucursal(pedido) {
  const { data } = await api.post('/pedidos/sucursal', pedido)
  return data
}
