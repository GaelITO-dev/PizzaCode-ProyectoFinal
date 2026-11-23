import { useState } from 'react'
import { Lock } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import estilosModal from '../../components/ui/Modal.module.css'
import { bloquearUsuario } from '../../api/usuariosApi'
import styles from './ModalBloqueo.module.css'

const MAXIMO_MOTIVO = 255

function ModalBloqueo({ usuario, onCerrar, onBloqueado }) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const nombre = `${usuario.nombre} ${usuario.apellidoPat}`

  async function enviar(evento) {
    evento.preventDefault()

    const limpio = motivo.trim()
    if (!limpio) {
      setError('Escribe el motivo del bloqueo')
      return
    }

    setGuardando(true)
    setError('')

    try {
      await bloquearUsuario(usuario.idUsuario, limpio)
      onBloqueado()
    } catch (err) {
      setError(err.response?.data?.errors?.motivo ?? err.mensajeUsuario)
      setGuardando(false)
    }
  }

  return (
    <Modal abierto titulo="Bloquear usuario" onCerrar={onCerrar}>
      <form onSubmit={enviar} noValidate>
        <p className={estilosModal.mensaje}>
          <strong>{nombre}</strong> no podrá iniciar sesión. Si tiene la sesión abierta, se cerrará en su
          siguiente acción.
        </p>

        <label htmlFor="motivo-bloqueo" className={styles.etiqueta}>
          Motivo
        </label>
        <textarea
          id="motivo-bloqueo"
          className={error ? `${styles.textarea} ${styles.conError}` : styles.textarea}
          rows={3}
          maxLength={MAXIMO_MOTIVO}
          placeholder="Ej. Pedidos no recogidos"
          value={motivo}
          onChange={(evento) => {
            setMotivo(evento.target.value)
            setError('')
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'error-motivo' : undefined}
          autoFocus
        />
        <p className={styles.contador}>
          {motivo.length}/{MAXIMO_MOTIVO}
        </p>

        {error && (
          <p id="error-motivo" className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={`${estilosModal.acciones} ${styles.acciones}`}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className={styles.botonBloquear} disabled={guardando}>
            <Lock size={16} aria-hidden="true" />
            {guardando ? 'Bloqueando…' : 'Bloquear'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalBloqueo
