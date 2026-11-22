import { Outlet } from 'react-router-dom'
import BarraLateral from './BarraLateral'
import styles from './AppLayout.module.css'

function AppLayout() {
  return (
    <div className={styles.contenedor}>
      <BarraLateral />
      <div className={styles.principal}>
        <header className={styles.barraSuperior} />
        <main className={styles.contenido}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout