import { useState } from 'react'
import { BellRing, Check, Mail, MessageCircle } from 'lucide-react'
import styles from './PerfilPage.module.css'

const CANALES = [
  { valor: 'WHATSAPP', texto: 'WhatsApp', icono: MessageCircle },
  { valor: 'CORREO', texto: 'Correo', icono: Mail },
  { valor: 'AMBOS', texto: 'Ambos', icono: BellRing },
]

function SelectorCanal({ valor, alCambiar, idEtiqueta }) {
  const [enCurso, setEnCurso] = useState(null)
  const [error, setError] = useState('')

  async function elegir(nuevo) {
    if (nuevo === valor || enCurso !== null) return

    setEnCurso(nuevo)
    setError('')

    try {
      await alCambiar({ canalTicket: nuevo })
    } catch (err) {
      setError(err.mensajeUsuario)
    } finally {
      setEnCurso(null)
    }
  }

  return (
    <>
      <div className={styles.chips} role="group" aria-labelledby={idEtiqueta}>
        {CANALES.map((canal) => {
          const seleccionado = valor === canal.valor
          const Icono = seleccionado ? Check : canal.icono
          return (
            <button
              key={canal.valor}
              type="button"
              className={`${styles.chip} ${seleccionado ? styles.chipSeleccionado : ''}`}
              aria-pressed={seleccionado}
              disabled={enCurso !== null}
              onClick={() => elegir(canal.valor)}
            >
              <Icono size={16} aria-hidden="true" />
              {enCurso === canal.valor ? 'Guardando…' : canal.texto}
            </button>
          )
        })}
      </div>

      {error && (
        <p className={styles.errorGeneral} role="alert">
          {error}
        </p>
      )}
    </>
  )
}

export default SelectorCanal
