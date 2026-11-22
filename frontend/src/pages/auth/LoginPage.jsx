import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import CampoTexto from '../../components/ui/CampoTexto'
import BotonPrimario from '../../components/ui/BotonPrimario'
import { useAuth } from '../../auth/useAuth'
import { validarLogin } from '../../utils/validaciones'
import styles from './AuthFormulario.module.css'

const VALORES_INICIALES = { correo: '', contrasena: '' }

function LoginPage() {
  const { estaAutenticado, login } = useAuth()
  const location = useLocation()

  const [valores, setValores] = useState(VALORES_INICIALES)
  const [tocados, setTocados] = useState({})
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

  if (estaAutenticado) {
    return <Navigate to="/inicio" replace />
  }

  const errores = validarLogin(valores)
  const sesionExpirada = location.state?.sesionExpirada

  function errorDe(campo) {
    return tocados[campo] || intentoEnviar ? errores[campo] : undefined
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setValores((anteriores) => ({ ...anteriores, [name]: value }))
    setErrorServidor(null)
  }

  function manejarSalida(evento) {
    const { name } = evento.target
    setTocados((anteriores) => ({ ...anteriores, [name]: true }))
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setIntentoEnviar(true)

    if (Object.keys(errores).length > 0) return

    setCargando(true)
    setErrorServidor(null)
    try {
      await login(valores.correo, valores.contrasena)
    } catch (error) {
      setErrorServidor(error.mensajeUsuario)
      setCargando(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className={`${styles.titulo} ${styles.centrado}`}>¿Hambre de pizza?</h1>

      {sesionExpirada && (
        <p className={styles.aviso} role="status">
          Tu sesión expiró. Inicia sesión de nuevo.
        </p>
      )}

      <form className={styles.formulario} onSubmit={manejarEnvio} noValidate>
        <CampoTexto
          etiqueta="Correo electrónico"
          name="correo"
          tipo="email"
          icono={Mail}
          placeholder="ejemplo@correo.com"
          autoComplete="email"
          value={valores.correo}
          onChange={manejarCambio}
          onBlur={manejarSalida}
          error={errorDe('correo')}
        />

        <CampoTexto
          etiqueta="Contraseña"
          name="contrasena"
          tipo="password"
          icono={Lock}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          value={valores.contrasena}
          onChange={manejarCambio}
          onBlur={manejarSalida}
          error={errorDe('contrasena')}
        />

        <Link to="/recuperar" className={`${styles.enlace} ${styles.enlaceCentrado}`}>
          ¿Olvidaste tu contraseña?
        </Link>

        {errorServidor && (
          <p className={styles.errorServidor} role="alert">
            {errorServidor}
          </p>
        )}

        <BotonPrimario cargando={cargando} textoCargando="Entrando...">
          Entrar
        </BotonPrimario>
      </form>

      <p className={styles.pie}>
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className={styles.enlace}>
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage