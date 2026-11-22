import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { NAVEGACION_POR_ROL, NOMBRE_ROL } from './navegacion'
import styles from './BarraLateral.module.css'

function BarraLateral({ id, abierta = false, alCerrar }) {
  const { usuario, logout } = useAuth()
  const enlaces = NAVEGACION_POR_ROL[usuario.rol] ?? []
  const botonCerrarRef = useRef(null)

  useEffect(() => {
    if (abierta) {
      botonCerrarRef.current?.focus()
    }
  }, [abierta])

  return (
    <aside id={id} className={abierta ? `${styles.barra} ${styles.abierta}` : styles.barra}>
      <div className={styles.encabezado}>
        <div className={styles.marca}>
          <span className={styles.nombre}>Pizza Code</span>
          <span className={styles.rol}>{NOMBRE_ROL[usuario.rol]}</span>
        </div>

        <button
          ref={botonCerrarRef}
          type="button"
          className={styles.cerrar}
          onClick={alCerrar}
          aria-label="Cerrar menú de navegación"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Navegación principal" className={styles.navegacion}>
        <p className={styles.seccion}>General</p>
        <ul className={styles.lista}>
          {enlaces.map(({ texto, ruta, icono: Icono, exacta }) => (
            <li key={ruta}>
              <NavLink
                to={ruta}
                end={exacta}
                onClick={alCerrar}
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