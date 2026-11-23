import api from './axiosClient'

// ADMIN: todos (visibles, ocultos, comentarios y sugerencias) con filtros del servidor
export async function listarComentariosAdmin(params) {
  const { data } = await api.get('/comentarios', { params })
  return data
}

export async function contarComentarios(params) {
  const data = await listarComentariosAdmin({ ...params, size: 1 })
  return data.page.totalElements
}

export async function cambiarVisibleComentario(id, valor) {
  const { data } = await api.patch(`/comentarios/${id}/visible`, null, { params: { valor } })
  return data
}

export async function eliminarComentario(id) {
  await api.delete(`/comentarios/${id}`)
}

// Likes: responden { idComentario, totalLikes, yaDioLike }
export async function darLike(id) {
  const { data } = await api.post(`/comentarios/${id}/like`)
  return data
}

export async function quitarLike(id) {
  const { data } = await api.delete(`/comentarios/${id}/like`)
  return data
}
