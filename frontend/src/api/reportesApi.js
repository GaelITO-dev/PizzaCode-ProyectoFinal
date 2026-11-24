import api from './axiosClient'

export async function obtenerGanancias(desde, hasta) {
  const { data } = await api.get('/reportes/ganancias', { params: { desde, hasta } })
  return data
}
