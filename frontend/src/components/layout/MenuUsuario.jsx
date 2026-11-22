import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, User } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../auth/useAuth'
import { NOMBRE_ROL } from './navegacion'
import styles from './MenuUsuario.module.css'

function MenuUsuario() {
  const { usuario, logout } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)
  const botonRef = useRef(null)
  const idPanel = useId()

  const nombreCompleto = [usuario.nombre, usuario.apellidoPat].filter(Boolean).join(' ')

  useEffect(() => {
    if (!abierto) return

    function alHacerClic(evento) {
      if (!contenedorRef.current?.contains(evento.target)) {
        setAbierto(false)
      }
    }

    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') {
        setAbierto(false)
        botonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', alHacerClic)
    document.addEventListener('keydown', alPresionarTecla)

    return () => {
      document.removeEventListener('mousedown', alHacerClic)
      document.removeEventListener('keydown', alPresionarTecla)
    }
  }, [abierto])

  return (
    <div className={styles.contenedor} ref={contenedorRef}>
      <button
        ref={botonRef}
        type="button"
        className={styles.disparador}
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((actual) => !actual)}
      >
        <Avatar nombre={usuario.nombre} apellido={usuario.apellidoPat} />
        <span className={styles.datos}>
          <span className={styles.nombre}>{nombreCompleto}</span>
          <span className={styles.correo}>{usuario.correo}</span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={abierto ? `${styles.flecha} ${styles.flechaAbierta}` : styles.flecha}
        />
      </button>

      {abierto && (
        <div id={idPanel} className={styles.panel}>
          <p className={styles.panelRol}>{NOMBRE_ROL[usuario.rol]}</p>

          <Link to="/perfil" className={styles.opcion} onClick={() => setAbierto(false)}>
            <User size={16} aria-hidden="true" />
            Mi perfil
          </Link>

          <button type="button" className={`${styles.opcion} ${styles.opcionSalir}`} onClick={logout}>
            <LogOut size={16} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default MenuUsuario