import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './CampoTexto.module.css'

function CampoTexto({
  etiqueta,
  etiquetaOculta = false,
  tipo = 'text',
  error,
  icono: Icono,
  ...propsInput
}) {
  const id = useId()
  const idError = `${id}-error`
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  const esContrasena = tipo === 'password'
  const tipoReal = esContrasena && mostrarContrasena ? 'text' : tipo

  const clasesControl = error
    ? `${styles.control} ${styles.conError}`
    : styles.control

  return (
    <div className={styles.campo}>
      <label
        htmlFor={id}
        className={etiquetaOculta ? styles.soloLectores : styles.etiqueta}
      >
        {etiqueta}
      </label>

      <div className={clasesControl}>
        {Icono && <Icono className={styles.icono} size={18} aria-hidden="true" />}

        <input
          id={id}
          type={tipoReal}
          className={styles.input}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? idError : undefined}
          {...propsInput}
        />

        {esContrasena && (
          <button
            type="button"
            className={styles.botonOjo}
            onClick={() => setMostrarContrasena((actual) => !actual)}
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p id={idError} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}

export default CampoTexto