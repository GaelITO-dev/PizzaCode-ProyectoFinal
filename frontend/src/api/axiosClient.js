import axios from 'axios'
import { tokenStorage } from './tokenStorage'
import { obtenerMensajeError } from './errores'

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const esLogin = error.config?.url?.includes('/auth/login')

    if (status === 401 && !esLogin && tokenStorage.get()) {
      tokenStorage.remove()
      manejadorNoAutorizado?.()
    }

    error.mensajeUsuario = obtenerMensajeError(error)
    return Promise.reject(error)
  }
)

export default api