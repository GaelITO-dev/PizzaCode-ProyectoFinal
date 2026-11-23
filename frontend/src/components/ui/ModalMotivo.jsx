import { useState } from 'react'
import Modal from './Modal'
import estilosModal from './Modal.module.css'
import styles from './ModalMotivo.module.css'

const MAXIMO = 255

// Modal que pide un motivo obligatorio antes de una acción delicada (cancelar, bloquear...)
function ModalMotivo({
  titulo,
  mensaje,
  etiqueta = 'Motivo',
  placeholder,
  textoAccion,
  textoGuardando = 'Guardando…',
  textoCerrar = 'Cancelar',
  icono: Icono,
  onConfirmar,
  onCerrar,
}) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()

    const limpio = motivo.trim()
    if (!limpio) {
      setError(`Escribe el ${etiqueta.toLowerCase()}`)
      return
    }

    setGuardando(true)
    setError('')

    try {
      await onConfirmar(limpio)
    } catch (err) {
      setError(err.response?.data?.errors?.motivo ?? err.mensajeUsuario)
      setGuardando(false)
    }
  }

  return (
    <Modal abierto titulo={titulo} onCerrar={onCerrar}>
      <form onSubmit={enviar} noValidate>
        <p className={estilosModal.mensaje}>{mensaje}</p>

        <label htmlFor="modal-motivo" className={styles.etiqueta}>
          {etiqueta}
        </label>
        <textarea
          id="modal-motivo"
          className={error ? `${styles.textarea} ${styles.conError}` : styles.textarea}
          rows={3}
          maxLength={MAXIMO}
          placeholder={placeholder}
          value={motivo}
          onChange={(evento) => {
            setMotivo(evento.target.value)
            setError('')
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'modal-motivo-error' : undefined}
          autoFocus
        />
        <p className={styles.contador}>
          {motivo.length}/{MAXIMO}
        </p>

        {error && (
          <p id="modal-motivo-error" className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={`${estilosModal.acciones} ${styles.acciones}`}>
          <button type="button" className={estilosModal.botonSecundario} onClick={onCerrar} disabled={guardando}>
            {textoCerrar}
          </button>
          <button type="submit" className={styles.botonPeligro} disabled={guardando}>
            {Icono && <Icono size={16} aria-hidden="true" />}
            {guardando ? textoGuardando : textoAccion}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalMotivo
