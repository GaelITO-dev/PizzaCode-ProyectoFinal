import api from './axiosClient'

// Búsqueda de clientes para el cajero (mínimo 2 caracteres; regresa hasta 5)
export async function buscarClientes(busqueda) {
  const { data } = await api.get('/clientes', { params: { busqueda, size: 5 } })
  return data.content
}
