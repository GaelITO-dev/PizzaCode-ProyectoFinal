import api from './axiosClient'

// Lista para el ADMIN (incluye no disponibles), con filtros y paginación del servidor
export async function listarProductosGestion(params) {
  const { data } = await api.get('/productos/gestion', { params })
  return data
}


export async function contarProductos(params) {
  const data = await listarProductosGestion({ ...params, size: 1 })
  return data.page.totalElements
}

export async function listarCategorias() {
  const { data } = await api.get('/categorias', { params: { size: 100, sort: 'nombre' } })
  return data.content
}

export async function crearProducto(producto) {
  const { data } = await api.post('/productos', producto)
  return data
}

export async function actualizarProducto(id, producto) {
  const { data } = await api.put(`/productos/${id}`, producto)
  return data
}

export async function cambiarDisponible(id, valor) {
  const { data } = await api.patch(`/productos/${id}/disponible`, null, { params: { valor } })
  return data
}

export async function eliminarProducto(id) {
  await api.delete(`/productos/${id}`)
}

// Menú público: solo productos disponibles (lo usan el punto de venta y el cliente)
export async function listarMenu(params) {
  const { data } = await api.get('/productos', { params })
  return data
}

// Detalle de un producto (cualquier usuario con sesión)
export async function obtenerProducto(id) {
  const { data } = await api.get(`/productos/${id}`)
  return data
}
