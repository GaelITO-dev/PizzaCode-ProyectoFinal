import { Check } from 'lucide-react'
import styles from './PasosCompra.module.css'

const PASOS = ['Carrito', 'Pago', 'Confirmación']

// Indicador Carrito → Pago → Confirmación; "actual" es 1, 2 o 3
function PasosCompra({ actual }) {
  return (
    <ol className={styles.pasos}>
      {PASOS.map((nombre, i) => {
        const numero = i + 1
        const hecho = numero < actual
        const clase = numero === actual ? styles.actual : hecho ? styles.hecho : styles.pendiente
        return (
          <li key={nombre} className={`${styles.paso} ${clase}`} aria-current={numero === actual ? 'step' : undefined}>
            <span className={styles.circulo}>{hecho ? <Check size={12} aria-hidden="true" /> : numero}</span>
            {nombre}
          </li>
        )
      })}
    </ol>
  )
}

export default PasosCompra
