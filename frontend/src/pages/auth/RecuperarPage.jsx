import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Clock, KeyRound, Mail, MailCheck } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import CampoTexto from '../../components/ui/CampoTexto'
import BotonPrimario from '../../components/ui/BotonPrimario'
import { solicitarRecuperacionApi } from '../../api/authApi'
import base from './AuthFormulario.module.css'
import styles from './RecuperacionContrasena.module.css'

// El backend ignora otra solicitud del mismo usuario antes de 60 s
const SEGUNDOS_PARA_REENVIAR = 60
const FORMATO_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// "gael.martinez@correo.com" -> "gael.m•••••@correo.com"
function enmascararCorreo(correo) {
  const [usuario, dominio] = correo.split('@')
  if (!dominio) return correo
  const visibles = Math.min(6, Math.max(1, usuario.length - 2))
  return `${usuario.slice(0, visibles)}•••••@${dominio}`
}

function RecuperarPage() {
  const location = useLocation()

  const [correo, setCorreo] = useState(location.state?.correo ?? '')
  const [error, setError] = useState(null)
  const [errorServidor, setErrorServidor] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [enviadoA, setEnviadoA] = useState(null)
  const [segundos, setSegundos] = useState(0)

  // Cuenta regresiva para poder reenviar el enlace
  useEffect(() => {
    if (segundos <= 0) return undefined
    const temporizador = setTimeout(() => setSegundos((actual) => actual - 1), 1000)
    return () => clearTimeout(temporizador)
  }, [segundos])

  async function enviar(destino) {
    setEnviando(true)
    setErrorServidor(null)
    try {
      await solicitarRecuperacionApi(destino)
      setEnviadoA(destino)
      setSegundos(SEGUNDOS_PARA_REENVIAR)
    } catch (err) {
      setErrorServidor(err.mensajeUsuario)
    } finally {
      setEnviando(false)
    }
  }

  function manejarEnvio(evento) {
    evento.preventDefault()
    const limpio = correo.trim()

    if (!limpio) {
      setError('Escribe tu correo electrónico')
      return
    }
    if (!FORMATO_CORREO.test(limpio)) {
      setError('El correo no tiene un formato válido')
      return
    }

    setError(null)
    enviar(limpio)
  }

  function cambiarCorreo() {
    setEnviadoA(null)
    setErrorServidor(null)
  }

  if (enviadoA) {
    const minutos = Math.floor(segundos / 60)
    const resto = String(segundos % 60).padStart(2, '0')

    return (
      <AuthLayout>
        <span className={`${styles.icono} ${styles.iconoExito}`} aria-hidden="true">
          <MailCheck size={22} />
        </span>
        <h1 className={base.titulo}>Revisa tu correo</h1>
        <p className={styles.texto}>
          Te enviamos un enlace a <strong>{enmascararCorreo(enviadoA)}</strong> para crear una nueva
          contraseña. El enlace vence en 30 minutos.
        </p>

        <div className={styles.nota}>
          <Clock size={16} aria-hidden="true" />
          <p>
            ¿No te llegó? Revisa tu carpeta de spam.{' '}
            {segundos > 0 ? (
              <span aria-live="polite">
                Podrás reenviarlo en {minutos}:{resto}.
              </span>
            ) : (
              <button
                type="button"
                className={styles.botonTexto}
                onClick={() => enviar(enviadoA)}
                disabled={enviando}
              >
                {enviando ? 'Reenviando…' : 'Reenviar enlace'}
              </button>
            )}
          </p>
        </div>

        {errorServidor && (
          <p className={base.errorServidor} role="alert">
            {errorServidor}
          </p>
        )}

        <Link to="/login" className={styles.botonEnlace}>
          Volver a iniciar sesión
        </Link>

        <p className={base.pie}>
          ¿Correo equivocado?{' '}
          <button type="button" className={styles.botonTexto} onClick={cambiarCorreo}>
            Cambiar correo
          </button>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <span className={styles.icono} aria-hidden="true">
        <KeyRound size={22} />
      </span>
      <h1 className={base.titulo}>¿Olvidaste tu contraseña?</h1>
      <p className={base.subtitulo}>
        Escribe el correo de tu cuenta y te enviamos un enlace para crear una nueva.
      </p>

      <form className={base.formulario} onSubmit={manejarEnvio} noValidate>
        <CampoTexto
          etiqueta="Correo electrónico"
          name="correo"
          tipo="email"
          icono={Mail}
          placeholder="ejemplo@correo.com"
          autoComplete="email"
          maxLength={100}
          value={correo}
          onChange={(evento) => {
            setCorreo(evento.target.value)
            setError(null)
            setErrorServidor(null)
          }}
          error={error}
          autoFocus
        />

        {errorServidor && (
          <p className={base.errorServidor} role="alert">
            {errorServidor}
          </p>
        )}

        <BotonPrimario cargando={enviando} textoCargando="Enviando...">
          <Mail size={18} aria-hidden="true" />
          Enviar enlace
        </BotonPrimario>
      </form>

      <Link to="/login" className={`${base.enlace} ${styles.volver}`}>
        <ArrowLeft size={14} aria-hidden="true" />
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}

export default RecuperarPage
