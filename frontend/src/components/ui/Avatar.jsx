import { obtenerIniciales } from '../../utils/iniciales'
import styles from './Avatar.module.css'

function Avatar({ nombre, apellido, tamano = 'mediano' }) {
  return (
    <span className={`${styles.avatar} ${styles[tamano]}`} aria-hidden="true">
      {obtenerIniciales(nombre, apellido)}
    </span>
  )
}

export default Avatar