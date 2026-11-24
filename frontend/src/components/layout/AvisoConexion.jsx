import { WifiOff } from 'lucide-react'
import { useEstadoConexion } from '../../conexion/estadoConexion'
import styles from './AvisoConexion.module.css'

// Aviso flotante para toda la app (incluido el login). Desaparece solo cuando vuelve la conexión.
function AvisoConexion() {
  const { sinInternet, sinServidor } = useEstadoConexion()
  if (!sinInternet && !sinServidor) return null

  const mensaje = sinInternet
    ? 'Sin conexión a internet. Los cambios no se guardarán hasta que vuelva.'
    : 'No se pudo conectar con el servidor. Algunos datos pueden no estar al día.'

  return (
    <div className={styles.aviso} role="alert">
      <WifiOff size={16} aria-hidden="true" />
      <span>{mensaje}</span>
      <button type="button" className={styles.boton} onClick={() => window.location.reload()}>
        Recargar
      </button>
    </div>
  )
}

export default AvisoConexion
