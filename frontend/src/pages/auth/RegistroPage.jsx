import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { User, Mail, Phone, Lock } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import CampoTexto from '../../components/ui/CampoTexto'
import BotonPrimario from '../../components/ui/BotonPrimario'
import ChecklistContrasena from '../../components/ui/ChecklistContrasena'
import { useAuth } from '../../auth/useAuth'
import { registrarApi } from '../../api/authApi'
import { validarRegistro, limpiarTelefono } from '../../utils/validaciones'
import styles from './AuthFormulario.module.css'

const VALORES_INICIALES = {
  nombre: '',
  apellidoPat: '',
  apellidoMat: '',
  correo: '',
  telefono: '',
  contrasena: '',
  confirmarContrasena: '',
  aceptaTerminos: false,
}

function RegistroPage() {
  const { estaAutenticado, login } = useAuth()

  const [valores, setValores] = useState(VALORES_INICIALES)
  const [tocados, setTocados] = useState({})
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [erroresServidor, setErroresServidor] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)

  if (estaAutenticado) {
    return <Navigate to="/inicio" replace />
  }

  const errores = validarRegistro(valores)

  function errorDe(campo) {
    if (erroresServidor[campo]) return erroresServidor[campo]
    return tocados[campo] || intentoEnviar ? errores[campo] : undefined
  }

  function manejarCambio(evento) {
    const { name, value, type, checked } = evento.target
    setValores((anteriores) => ({
      ...anteriores,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErroresServidor((anteriores) => {
      const copia = { ...anteriores }
      delete copia[name]
      return copia
    })
    setErrorGeneral(null)
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
    setErroresServidor({})
    setErrorGeneral(null)

    const datos = {
      nombre: valores.nombre.trim(),
      apellidoPat: valores.apellidoPat.trim(),
      apellidoMat: valores.apellidoMat.trim() || null,
      correo: valores.correo.trim(),
      telefono: limpiarTelefono(valores.telefono),
      contrasena: valores.contrasena,
    }

    try {
      await registrarApi(datos)
    } catch (error) {
      const { status, data } = error.response ?? {}

      if (status === 400 && data?.errors && Object.keys(data.errors).length > 0) {
        setErroresServidor(data.errors)
      } else if (status === 409) {
        setErroresServidor({ correo: error.mensajeUsuario })
      } else {
        setErrorGeneral(error.mensajeUsuario)
      }
      setCargando(false)
      return
    }

    try {
      await login(datos.correo, datos.contrasena)
    } catch {
      setErrorGeneral(
        'Tu cuenta se creó, pero no pudimos iniciar sesión. Entra desde la pantalla de inicio de sesión.',
      )
      setCargando(false)
    }
  }

  const errorTerminos = errorDe('aceptaTerminos')

  return (
    <AuthLayout ancho="ancho">
      <h1 className={styles.titulo}>Crea tu cuenta</h1>
      <p className={styles.subtitulo}>
        Regístrate para pedir tu pizza en minutos y seguir tus pedidos.
      </p>

      <form className={styles.formulario} onSubmit={manejarEnvio} noValidate>
        <fieldset className={styles.grupo}>
          <legend className={styles.leyenda}>Nombre completo</legend>

          <CampoTexto
            etiqueta="Nombre"
            etiquetaOculta
            name="nombre"
            icono={User}
            placeholder="Nombre"
            autoComplete="given-name"
            maxLength={50}
            value={valores.nombre}
            onChange={manejarCambio}
            onBlur={manejarSalida}
            error={errorDe('nombre')}
          />

          <CampoTexto
            etiqueta="Primer apellido"
            etiquetaOculta
            name="apellidoPat"
            icono={User}
            placeholder="Primer apellido"
            autoComplete="family-name"
            maxLength={50}
            value={valores.apellidoPat}
            onChange={manejarCambio}
            onBlur={manejarSalida}
            error={errorDe('apellidoPat')}
          />

          <CampoTexto
            etiqueta="Segundo apellido (opcional)"
            etiquetaOculta
            name="apellidoMat"
            icono={User}
            placeholder="Segundo apellido (opcional)"
            maxLength={50}
            value={valores.apellidoMat}
            onChange={manejarCambio}
            onBlur={manejarSalida}
            error={errorDe('apellidoMat')}
          />
        </fieldset>

        <div className={styles.fila}>
          <CampoTexto
            etiqueta="Correo electrónico"
            name="correo"
            tipo="email"
            icono={Mail}
            placeholder="ejemplo@correo.com"
            autoComplete="email"
            maxLength={100}
            value={valores.correo}
            onChange={manejarCambio}
            onBlur={manejarSalida}
            error={errorDe('correo')}
          />

          <CampoTexto
            etiqueta="Teléfono (WhatsApp)"
            name="telefono"
            tipo="tel"
            inputMode="tel"
            icono={Phone}
            placeholder="55 1234 5678"
            autoComplete="tel"
            maxLength={20}
            value={valores.telefono}
            onChange={manejarCambio}
            onBlur={manejarSalida}
            error={errorDe('telefono')}
          />
        </div>

        <div className={styles.fila}>
          <CampoTexto
            etiqueta="Contraseña"
            name="contrasena"
            tipo="password"
            icono={Lock}
            placeholder="Crea tu contraseña"
            autoComplete="new-password"
            value={valores.contrasena}
            onChange={manejarCambio}
            onBlur={manejarSalida}
            error={errorDe('contrasena')}
          />

          <CampoTexto
            etiqueta="Confirmar contraseña"
            name="confirmarContrasena"
            tipo="password"
            icono={Lock}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            value={valores.confirmarContrasena}
            onChange={manejarCambio}
            onBlur={manejarSalida}
            error={errorDe('confirmarContrasena')}
          />
        </div>

        <ChecklistContrasena contrasena={valores.contrasena} />

        <div>
          <label className={styles.terminos}>
            <input
              type="checkbox"
              name="aceptaTerminos"
              checked={valores.aceptaTerminos}
              onChange={manejarCambio}
              onBlur={manejarSalida}
              aria-invalid={Boolean(errorTerminos)}
              aria-describedby={errorTerminos ? 'terminos-error' : undefined}
            />
            Acepto los términos y el aviso de privacidad de Pizza Code
          </label>
          {errorTerminos && (
            <p id="terminos-error" className={styles.errorCampo}>
              {errorTerminos}
            </p>
          )}
        </div>

        {errorGeneral && (
          <p className={styles.errorServidor} role="alert">
            {errorGeneral}
          </p>
        )}

        <BotonPrimario cargando={cargando} textoCargando="Creando cuenta...">
          Crear cuenta
        </BotonPrimario>
      </form>

      <p className={styles.pie}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className={styles.enlace}>
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}

export default RegistroPage