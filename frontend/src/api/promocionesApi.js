import api from './axiosClient'

export async function listarPromociones(params) {
  const { data } = await api.get('/promociones', { params })
  return data
}

// Para las tarjetas de resumen: el servidor cuenta
export async function contarPromociones(estado) {
  const data = await listarPromociones({ estado, size: 1 })
  return data.page.totalElements
}

export async function obtenerPromocion(id) {
  const { data } = await api.get(`/promociones/${id}`)
  return data
}

export async function crearPromocion(promocion) {
  const { data } = await api.post('/promociones', promocion)
  return data
}

export async function actualizarPromocion(id, promocion) {
  const { data } = await api.put(`/promociones/${id}`, promocion)
  return data
}

export async function eliminarPromocion(id) {
  await api.delete(`/promociones/${id}`)
}
