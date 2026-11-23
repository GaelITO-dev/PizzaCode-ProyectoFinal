import { useState } from 'react'
import { Check, Lock } from 'lucide-react'
import CampoTexto from '../../components/ui/CampoTexto'
import ChecklistContrasena from '../../components/ui/ChecklistContrasena'
import { cambiarContrasenaApi } from '../../api/perfilApi'
import { validarCambioContrasena } from '../../utils/validaciones'
import styles from './PerfilPage.module.css'

const VACIO = {
  contrasenaActual: '',
  contrasenaNueva: '',
  confirmarContrasena: '',
}

function CambiarContrasena({ alCancelar, alTerminar }) {
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cambiar(evento) {
    const { name, value } = evento.target
    setDatos((actual) => ({ ...actual, [name]: value }))
    setErrores((actual) => ({ ...actual, [name]: undefined }))
  }

  function mostrarErrorDelServidor(err) {
    const status = err.response?.status
    const mensaje = err.response?.data?.message ?? ''
    const delServidor = err.response?.data?.errors

    if (status === 422 && mensaje.includes('incorrecta')) {
      setErrores({ contrasenaActual: mensaje })
    } else if (status === 422) {
      setErrores({ contrasenaNueva: mensaje })
    } else if (delServidor && Object.keys(delServidor).length > 0) {
      setErrores(delServidor)
    } else {
      setErrorGeneral(err.mensajeUsuario)
    }
  }

  async function enviar(evento) {
    evento.preventDefault()

    const encontrados = validarCambioContrasena(datos)
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      return
    }

    setGuardando(true)
    setErrorGeneral('')

    try {
      await cambiarContrasenaApi(datos.contrasenaActual, datos.contrasenaNueva)
      alTerminar()
    } catch (err) {
      mostrarErrorDelServidor(err)
      setGuardando(false)
    }
  }

  function alPresionarTecla(evento) {
    if (evento.key === 'Escape') alCancelar()
  }

  return (
    <form
      className={styles.panel}
      onSubmit={enviar}
      onKeyDown={alPresionarTecla}
      noValidate
      aria-labelledby="titulo-cambiar-contrasena"
    >
      <h3 id="titulo-cambiar-contrasena" className={styles.tituloPanel}>Cambiar contraseña</h3>

      <CampoTexto
        etiqueta="Contraseña actual"
        tipo="password"
        name="contrasenaActual"
        icono={Lock}
        value={datos.contrasenaActual}
        onChange={cambiar}
        error={errores.contrasenaActual}
        autoComplete="current-password"
        autoFocus
      />

      <div className={styles.camposContrasena}>
        <CampoTexto
          etiqueta="Nueva contraseña"
          tipo="password"
          name="contrasenaNueva"
          icono={Lock}
          value={datos.contrasenaNueva}
          onChange={cambiar}
          error={errores.contrasenaNueva}
          autoComplete="new-password"
          maxLength={72}
        />
        <CampoTexto
          etiqueta="Confirmar nueva contraseña"
          tipo="password"
          name="confirmarContrasena"
          icono={Lock}
          value={datos.confirmarContrasena}
          onChange={cambiar}
          error={errores.confirmarContrasena}
          autoComplete="new-password"
          maxLength={72}
        />
      </div>

      <div>
        <p className={styles.textoChecklist}>Tu nueva contraseña debe tener:</p>
        <ChecklistContrasena contrasena={datos.contrasenaNueva} />
      </div>

      {errorGeneral && (
        <p className={styles.errorGeneral} role="alert">
          {errorGeneral}
        </p>
      )}

      <div className={styles.acciones}>
        <button type="button" className={styles.botonSecundario} onClick={alCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className={styles.botonPrimario} disabled={guardando}>
          <Check size={16} aria-hidden="true" />
          {guardando ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </div>
    </form>
  )
}

export default CambiarContrasena
