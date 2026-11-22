import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { rutaInicio } from '../auth/rutasPorRol'
import styles from './NoAutorizadoPage.module.css'

function NoAutorizadoPage() {
  const { usuario } = useAuth()

  return (
    <main className={styles.pantalla}>
      <section className={styles.tarjeta}>
        <ShieldAlert size={48} className={styles.icono} aria-hidden="true" />
        <h1 className={styles.titulo}>No tienes permiso</h1>
        <p className={styles.texto}>
          Tu cuenta no tiene acceso a esta sección.
        </p>
        <Link to={rutaInicio(usuario.rol)} className={styles.boton}>
          Ir a mi inicio
        </Link>
      </section>
    </main>
  )
}

export default NoAutorizadoPage