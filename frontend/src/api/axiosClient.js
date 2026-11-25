import axios from 'axios'
import { tokenStorage } from './tokenStorage'
import { obtenerMensajeError } from './errores'
import { marcarServidorCaido, marcarServidorDisponible } from '../conexion/estadoConexion'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let manejadorNoAutorizado = null

export function registrarManejadorNoAutorizado(fn) {
  manejadorNoAutorizado = fn
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// El servidor "no está" si no hubo respuesta (y no fue una cancelación), o si el proxy
// devolvió 502/503/504, o un 500 sin el cuerpo de error del backend (ApiError siempre trae message).
function servidorNoDisponible(error) {
  const respuesta = error.response
  if (!respuesta) return !axios.isCancel(error)
  if ([502, 503, 504].includes(respuesta.status)) return true
  return respuesta.status >= 500 && !respuesta.data?.message
}

api.interceptors.response.use(
  (response) => {
    marcarServidorDisponible()
    return response
  },
  (error) => {
    if (servidorNoDisponible(error)) {
      marcarServidorCaido()
    } else if (error.response) {
      // El servidor sí contestó (aunque sea con 4xx): la conexión está bien
      marcarServidorDisponible()
    }

    const status = error.response?.status
    const url = error.config?.url ?? ''
    const esAutenticacion = url.includes('/auth/login') || url.includes('/auth/logout')

        // Solo cierra la sesión si el token rechazado es el actual (otra pestaña pudo usar uno viejo)
    const tokenUsado = error.config?.headers?.Authorization?.replace('Bearer ', '')
    if (status === 401 && !esAutenticacion && tokenUsado && tokenUsado === tokenStorage.get()) {
      tokenStorage.remove()
      manejadorNoAutorizado?.()
    }

    error.mensajeUsuario = obtenerMensajeError(error)
    return Promise.reject(error)
  }
)

export default api