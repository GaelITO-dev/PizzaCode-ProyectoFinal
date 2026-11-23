import { useState } from 'react'
import { Check } from 'lucide-react'
import CampoTexto from '../../components/ui/CampoTexto'
import { limpiarTelefono, validarTelefonoPerfil } from '../../utils/validaciones'
import styles from './PerfilPage.module.css'

function EditarTelefono({ telefonoActual, alGuardar, alCancelar }) {
  const [telefono, setTelefono] = useState(telefonoActual ?? '')
  const [error, setError] = useState('')
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cambiar(evento) {
    setTelefono(evento.target.value)
    setError('')
  }

  async function enviar(evento) {
    evento.preventDefault()

    const encontrados = validarTelefonoPerfil(telefono)
    if (encontrados.telefono) {
      setError(encontrados.telefono)
      return
    }

    setGuardando(true)
    setErrorGeneral('')

    try {
      await alGuardar({ telefono: limpiarTelefono(telefono) })
    } catch (err) {
      const delServidor = err.response?.data?.errors?.telefono
      if (delServidor) {
        setError(delServidor)
      } else {
        setErrorGeneral(err.mensajeUsuario)
      }
      setGuardando(false)
    }
  }

  function alPresionarTecla(evento) {
    if (evento.key === 'Escape') alCancelar()
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} onKeyDown={alPresionarTecla} noValidate>
      <CampoTexto
        etiqueta="Teléfono"
        tipo="tel"
        name="telefono"
        value={telefono}
        onChange={cambiar}
        error={error}
        autoComplete="tel"
        inputMode="numeric"
        maxLength={20}
        autoFocus
      />

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
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default EditarTelefono
