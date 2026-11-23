import styles from './Interruptor.module.css'

// Interruptor tipo "switch" (es un checkbox con estilo)
function Interruptor({ activo, onCambiar, etiqueta, disabled = false }) {
  return (
    <label className={styles.interruptor}>
      <input
        type="checkbox"
        className={styles.input}
        checked={activo}
        disabled={disabled}
        onChange={(e) => onCambiar(e.target.checked)}
      />
      <span className={styles.pista} aria-hidden="true" />
      <span>{etiqueta}</span>
    </label>
  )
}

export default Interruptor