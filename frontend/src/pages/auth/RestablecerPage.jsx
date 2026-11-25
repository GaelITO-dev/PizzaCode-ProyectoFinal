import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import CampoTexto from '../../components/ui/CampoTexto'
import BotonPrimario from '../../components/ui/BotonPrimario'
import ChecklistContrasena from '../../components/ui/ChecklistContrasena'
import { useAuth } from '../../auth/useAuth'
import { rutaInicio } from '../../auth/rutasPorRol'
import { restablecerContrasenaApi } from '../../api/authApi'
import { requisitosContrasena } from '../../utils/validaciones'
import base from './AuthFormulario.module.css'
import styles from './RecuperacionContrasena.module.css'

const REQUISITOS = ['longitud', 'mayuscula', 'numero', 'especial']

function RestablecerPage() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token') ?? ''
  const { guardarSesion } = useAuth()
  const navigate = useNavigate()

  const [valores, setValores] = useState({ nueva: '', confirmar: '' })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)
  const [enlaceInvalido, setEnlaceInvalido] = useState(!token)
  const [guardando, setGuardando] = useState(false)

  function cambiar(evento) {
    const { name, value } = evento.target
    setValores((actuales) => ({ ...actuales, [name]: value }))
    setErrores((actuales) => ({ ...actuales, [name]: undefined }))
    setErrorServidor(null)
  }

  function validar() {
    const encontrados = {}
    const cumplidos = requisitosContrasena(valores.nueva)

    if (!valores.nueva) {
      encontrados.nueva = 'Escribe tu nueva contraseña'
    } else if (!REQUISITOS.every((clave) => cumplidos[clave])) {
      encontrados.nueva = 'La contraseña no cumple los requisitos'
    }

    if (!valores.confirmar) {
      encontrados.confirmar = 'Confirma tu nueva contraseña'
    } else if (valores.confirmar !== valores.nueva) {
      encontrados.confirmar = 'Las contraseñas no coinciden'
    }

    return encontrados
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()

    const encontrados = validar()
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setGuardando(true)
    setErrorServidor(null)

    try {
      // El backend responde igual que el login: se guarda la sesión y se entra directo
      const respuesta = await restablecerContrasenaApi(token, valores.nueva)
      const usuario = guardarSesion(respuesta)
      navigate(rutaInicio(usuario.rol), { replace: true })
    } catch (err) {
      const { status, data } = err.response ?? {}
      const mensaje = data?.message ?? ''

      if (status === 422 && mensaje.includes('diferente')) {
        setErrores({ nueva: mensaje })
      } else if (status === 422) {
        setEnlaceInvalido(true)
      } else if (status === 400 && data?.errors?.nuevaContrasena) {
        setErrores({ nueva: data.errors.nuevaContrasena })
      } else {
        setErrorServidor(err.mensajeUsuario)
      }
      setGuardando(false)
    }
  }

  if (enlaceInvalido) {
    return (
      <AuthLayout>
        <h1 className={base.titulo}>Este enlace ya no sirve</h1>
        <p className={styles.texto}>
          El enlace no es válido, ya se usó o venció (dura 30 minutos). Pide uno nuevo para crear tu
          contraseña.
        </p>
        <Link to="/recuperar" className={styles.botonEnlace}>
          Pedir un enlace nuevo
        </Link>
        <p className={base.pie}>
          <Link to="/login" className={base.enlace}>
            Volver a iniciar sesión
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className={base.titulo}>Crea tu nueva contraseña</h1>
      <p className={base.subtitulo}>Elige una contraseña que no hayas usado antes.</p>

      <form className={base.formulario} onSubmit={manejarEnvio} noValidate>
        <CampoTexto
          etiqueta="Nueva contraseña"
          tipo="password"
          name="nueva"
          icono={Lock}
          autoComplete="new-password"
          maxLength={72}
          value={valores.nueva}
          onChange={cambiar}
          error={errores.nueva}
          autoFocus
        />

        <CampoTexto
          etiqueta="Confirmar contraseña"
          tipo="password"
          name="confirmar"
          icono={Lock}
          autoComplete="new-password"
          maxLength={72}
          value={valores.confirmar}
          onChange={cambiar}
          error={errores.confirmar}
        />

        <ChecklistContrasena contrasena={valores.nueva} />

        {errorServidor && (
          <p className={base.errorServidor} role="alert">
            {errorServidor}
          </p>
        )}

        <BotonPrimario cargando={guardando} textoCargando="Guardando...">
          Guardar y entrar
        </BotonPrimario>
      </form>
    </AuthLayout>
  )
}

export default RestablecerPage
