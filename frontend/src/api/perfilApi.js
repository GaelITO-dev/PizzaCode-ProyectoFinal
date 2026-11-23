import api from './axiosClient'

export async function obtenerPerfilApi() {
  const { data } = await api.get('/usuarios/me')
  return data
}

export async function actualizarPerfilApi(cambios) {
  const { data } = await api.patch('/usuarios/me', cambios)
  return data
}
