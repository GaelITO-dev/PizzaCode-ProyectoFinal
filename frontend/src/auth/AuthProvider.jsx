import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import { tokenExpirado } from './jwt'
import { loginApi, logoutApi } from '../api/authApi'
import { registrarManejadorNoAutorizado } from '../api/axiosClient'
import { tokenStorage } from '../api/tokenStorage'
import { usuarioStorage } from '../api/usuarioStorage'

// Lectura pura: solo mira el almacenamiento, no borra nada.
function leerSesion() {
  const token = tokenStorage.get()
  const usuario = usuarioStorage.get()

  if (token && usuario && !tokenExpirado(token)) {
    return usuario
  }
  return null
}

// Solo al arrancar la app: además limpia restos de una sesión inválida o vencida.
function leerSesionGuardada() {
  const usuario = leerSesion()

  if (usuario === null) {
    tokenStorage.remove()
    usuarioStorage.remove()
  }
  return usuario
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesionGuardada)
  const navigate = useNavigate()

  // Guarda la sesión a partir de una respuesta del backend (login o restablecer contraseña)
  const guardarSesion = useCallback((respuesta) => {
    const datosUsuario = {
      idUsuario: respuesta.idUsuario,
      nombre: respuesta.nombre,
      apellidoPat: respuesta.apellidoPat,
      correo: respuesta.correo,
      rol: respuesta.rol,
    }

    usuarioStorage.set(datosUsuario)
    tokenStorage.set(respuesta.token)
    setUsuario(datosUsuario)
    return datosUsuario
  }, [])

  const login = useCallback(
    async (correo, contrasena) => guardarSesion(await loginApi(correo, contrasena)),
    [guardarSesion],
  )

    const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // Si el backend no responde, la sesión se cierra igual en el navegador (finally).
    } finally {
      tokenStorage.remove()
      usuarioStorage.remove()
      setUsuario(null)
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const actualizarUsuario = useCallback((cambios) => {
    const actualizado = { ...usuarioStorage.get(), ...cambios }
    usuarioStorage.set(actualizado)
    setUsuario(actualizado)
  }, [])

  useEffect(() => {
    registrarManejadorNoAutorizado(() => {
      usuarioStorage.remove()
      setUsuario(null)
      navigate('/login', { replace: true, state: { sesionExpirada: true } })
    })
    return () => registrarManejadorNoAutorizado(null)
  }, [navigate])

  useEffect(() => {
  function sincronizarSesion() {
    setUsuario(leerSesion())
  }

  function alMostrarPagina(evento) {
    if (evento.persisted) {
      sincronizarSesion()
    }
  }

  function alCambiarAlmacenamiento(evento) {
    if (evento.key === null || evento.key.startsWith('pizzacode_')) {
      sincronizarSesion()
    }
  }

  window.addEventListener('pageshow', alMostrarPagina)
  window.addEventListener('storage', alCambiarAlmacenamiento)

  return () => {
    window.removeEventListener('pageshow', alMostrarPagina)
    window.removeEventListener('storage', alCambiarAlmacenamiento)
  }
}, [])

  const valor = useMemo(
    () => ({
      usuario,
      estaAutenticado: usuario !== null,
      login,
      guardarSesion,
      logout,
      actualizarUsuario,
    }),
    [usuario, login, guardarSesion, logout, actualizarUsuario],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}