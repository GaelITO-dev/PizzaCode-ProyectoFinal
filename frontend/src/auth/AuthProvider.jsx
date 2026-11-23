import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'
import { tokenExpirado } from './jwt'
import { loginApi, logoutApi } from '../api/authApi'
import { registrarManejadorNoAutorizado } from '../api/axiosClient'
import { tokenStorage } from '../api/tokenStorage'
import { usuarioStorage } from '../api/usuarioStorage'

function leerSesionGuardada() {
  const token = tokenStorage.get()
  const usuario = usuarioStorage.get()

  if (token && usuario && !tokenExpirado(token)) {
    return usuario
  }

  tokenStorage.remove()
  usuarioStorage.remove()
  return null
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesionGuardada)
  const navigate = useNavigate()

  const login = useCallback(async (correo, contrasena) => {
    const respuesta = await loginApi(correo, contrasena)

    const datosUsuario = {
      idUsuario: respuesta.idUsuario,
      nombre: respuesta.nombre,
      apellidoPat: respuesta.apellidoPat,
      correo: respuesta.correo,
      rol: respuesta.rol,
    }

    tokenStorage.set(respuesta.token)
    usuarioStorage.set(datosUsuario)
    setUsuario(datosUsuario)
    return datosUsuario
  }, [])

  const logout = useCallback(async () => {
  try {
    await logoutApi()
  } catch {
  } finally {
    tokenStorage.remove()
    usuarioStorage.remove()
    setUsuario(null)
    navigate('/login', { replace: true })
  }
}, [navigate])

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
    setUsuario(leerSesionGuardada())
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
      logout,
    }),
    [usuario, login, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}