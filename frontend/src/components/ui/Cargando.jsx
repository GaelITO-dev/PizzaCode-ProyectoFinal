import styles from './Cargando.module.css'

// Indicador de carga compartido. Es un <span> para poder ir dentro de <p> o <td> sin romper el HTML.
// role="status" hace que los lectores de pantalla anuncien el texto.
function Cargando({ texto = 'Cargando…', centrado = false }) {
  return (
    <span className={`${styles.cargando} ${centrado ? styles.centrado : ''}`} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{texto}</span>
    </span>
  )
}

export default Cargando
