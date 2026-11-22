import fotoPizza from '../../assets/pizza-auth.png'
import logo from '../../assets/logo-pizzacode.png'
import styles from './AuthLayout.module.css'

function AuthLayout({ children, ancho = 'angosto' }) {
  const claseTarjeta = ancho === 'ancho'
    ? `${styles.tarjeta} ${styles.tarjetaAncha}`
    : styles.tarjeta

  return (
    <div className={styles.pantalla}>
      <div className={styles.franja} aria-hidden="true">
        <img src={fotoPizza} alt="" className={styles.foto} />
      </div>

      <main className={styles.contenido}>
        <svg
          className={styles.curva}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 0 H100 V18 C75 22 45 45 0 85 Z" />
        </svg>

        <img src={logo} alt="Pizza Code" className={styles.logo} />

        <section className={claseTarjeta}>
          {children}
        </section>
      </main>
    </div>
  )
}

export default AuthLayout