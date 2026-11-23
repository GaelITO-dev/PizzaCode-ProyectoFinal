import api from './axiosClient'

export async function listarProductosGestion(params) {
  const { data } = await api.get('/productos/gestion', { params })
  return data
}

export async function listarCategorias() {
  const { data } = await api.get('/categorias', { params: { size: 100 } })
  return data.content
}

export async function cambiarDisponible(id, valor) {
  const { data } = await api.patch(`/productos/${id}/disponible`, null, { params: { valor } })
  return data
}

export async function eliminarProducto(id) {
  await api.delete(`/productos/${id}`)
}