import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import BarraLateral from './BarraLateral'
import MenuUsuario from './MenuUsuario'
import styles from './AppLayout.module.css'

const ID_BARRA = 'barra-lateral'

function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonMenuRef = useRef(null)

  function cerrarMenu() {
    setMenuAbierto(false)
  }

  useEffect(() => {
    if (!menuAbierto) return

    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') {
        setMenuAbierto(false)
        botonMenuRef.current?.focus()
      }
    }

    const escritorio = window.matchMedia('(min-width: 769px)')
    function alCambiarTamano(evento) {
      if (evento.matches) setMenuAbierto(false)
    }

    document.addEventListener('keydown', alPresionarTecla)
    escritorio.addEventListener('change', alCambiarTamano)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alPresionarTecla)
      escritorio.removeEventListener('change', alCambiarTamano)
      document.body.style.overflow = ''
    }
  }, [menuAbierto])

  return (
    <div className={styles.contenedor}>
      <BarraLateral id={ID_BARRA} abierta={menuAbierto} alCerrar={cerrarMenu} />

      {menuAbierto && (
        <div className={styles.fondo} onClick={cerrarMenu} aria-hidden="true" />
      )}

      <div className={styles.principal}>
        <header className={styles.barraSuperior}>
          <button
            ref={botonMenuRef}
            type="button"
            className={styles.botonMenu}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            aria-controls={ID_BARRA}
            onClick={() => setMenuAbierto(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>

          <span className={styles.marcaMovil}>Pizza Code</span>

          <MenuUsuario />
        </header>

        <main className={styles.contenido}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout