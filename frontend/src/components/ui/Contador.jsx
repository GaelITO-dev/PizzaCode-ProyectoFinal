import { Minus, Plus } from 'lucide-react'
import styles from './Contador.module.css'

// Botones − cantidad + (cantidad entre 1 y maximo)
function Contador({ valor, maximo = 20, onCambiar, etiqueta = 'Cantidad' }) {
  return (
    <div className={styles.contador} role="group" aria-label={etiqueta}>
      <button type="button" aria-label="Quitar uno" disabled={valor <= 1} onClick={() => onCambiar(valor - 1)}>
        <Minus size={14} aria-hidden="true" />
      </button>
      <span aria-live="polite">{valor}</span>
      <button type="button" aria-label="Agregar uno" disabled={valor >= maximo} onClick={() => onCambiar(valor + 1)}>
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  )
}

export default Contador
