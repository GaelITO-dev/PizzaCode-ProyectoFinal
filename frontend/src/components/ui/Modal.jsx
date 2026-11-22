import { X } from 'lucide-react'
import styles from './Modal.module.css'


function Modal({ abierto, titulo, onCerrar, children }) {
  if (!abierto) return null

  return (
    <div className={styles.fondo} onClick={onCerrar}>
      <div className={styles.caja} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>{titulo}</h2>
          <button type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal