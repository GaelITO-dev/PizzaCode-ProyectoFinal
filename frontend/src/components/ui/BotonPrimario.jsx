import styles from './BotonPrimario.module.css'

function BotonPrimario({
  children,
  cargando = false,
  textoCargando = 'Cargando...',
  type = 'submit',
  disabled = false,
  ...propsBoton
}) {
  return (
    <button
      type={type}
      className={styles.boton}
      disabled={disabled || cargando}
      aria-busy={cargando}
      {...propsBoton}
    >
      {cargando && <span className={styles.spinner} aria-hidden="true" />}
      {cargando ? textoCargando : children}
    </button>
  )
}

export default BotonPrimario