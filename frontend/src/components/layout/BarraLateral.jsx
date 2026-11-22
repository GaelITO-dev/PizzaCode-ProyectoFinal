import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { NAVEGACION_POR_ROL, NOMBRE_ROL } from './navegacion'
import styles from './BarraLateral.module.css'

function BarraLateral() {
  const { usuario, logout } = useAuth()
  const enlaces = NAVEGACION_POR_ROL[usuario.rol] ?? []

  return (
    <aside className={styles.barra}>
      <div className={styles.marca}>
        <span className={styles.nombre}>Pizza Code</span>
        <span className={styles.rol}>{NOMBRE_ROL[usuario.rol]}</span>
      </div>

      <nav aria-label="Navegación principal" className={styles.navegacion}>
        <p className={styles.seccion}>General</p>
        <ul className={styles.lista}>
          {enlaces.map(({ texto, ruta, icono: Icono, exacta }) => (
            <li key={ruta}>
              <NavLink
                to={ruta}
                end={exacta}
                className={({ isActive }) =>
                  isActive ? `${styles.enlace} ${styles.activo}` : styles.enlace
                }
              >
                <Icono size={18} aria-hidden="true" />
                {texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className={styles.salir} onClick={logout}>
        <LogOut size={18} aria-hidden="true" />
        Cerrar sesión
      </button>
    </aside>
  )
}

export default BarraLateral