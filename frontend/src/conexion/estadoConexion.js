import { useSyncExternalStore } from 'react'

// Estado global de la conexión. Lo actualizan el interceptor de Axios (¿respondió el servidor?)
// y los eventos del navegador (¿hay internet?). Cualquier componente lo lee con useEstadoConexion().
let estado = { sinInternet: !navigator.onLine, sinServidor: false }
const suscriptores = new Set()

function cambiar(cambios) {
  const nuevo = { ...estado, ...cambios }
  if (nuevo.sinInternet === estado.sinInternet && nuevo.sinServidor === estado.sinServidor) return
  estado = nuevo
  suscriptores.forEach((avisar) => avisar())
}

export function marcarServidorDisponible() {
  cambiar({ sinServidor: false })
}

export function marcarServidorCaido() {
  cambiar({ sinServidor: true })
}

window.addEventListener('online', () => cambiar({ sinInternet: false }))
window.addEventListener('offline', () => cambiar({ sinInternet: true }))

function suscribir(avisar) {
  suscriptores.add(avisar)
  return () => suscriptores.delete(avisar)
}

function leerEstado() {
  return estado
}

export function useEstadoConexion() {
  return useSyncExternalStore(suscribir, leerEstado)
}
