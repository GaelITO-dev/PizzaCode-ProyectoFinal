import api from './axiosClient'

export async function obtenerPerfilApi() {
  const { data } = await api.get('/usuarios/me')
  return data
}
