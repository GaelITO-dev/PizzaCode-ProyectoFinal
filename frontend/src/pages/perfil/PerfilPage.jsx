import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BellRing,
  Check,
  ChevronRight,
  History,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
} from 'lucide-react'
import { obtenerPerfilApi } from '../../api/perfilApi'
import { useAuth } from '../../auth/useAuth'
import Avatar from '../../components/ui/Avatar'
import { NOMBRE_ROL } from '../../components/layout/navegacion'
import styles from './PerfilPage.module.css'

const CANALES = [
  { valor: 'WHATSAPP', texto: 'WhatsApp', icono: MessageCircle },
  { valor: 'CORREO', texto: 'Correo', icono: Mail },
  { valor: 'AMBOS', texto: 'Ambos', icono: BellRing },
]

function nombreCompleto({ nombre, apellidoPat, apellidoMat }) {
  return [nombre, apellidoPat, apellidoMat].filter(Boolean).join(' ')
}

function formatearTelefono(telefono) {
  if (!telefono) return 'Sin registrar'
  if (/^\d{10}$/.test(telefono)) {
    return `${telefono.slice(0, 2)} ${telefono.slice(2, 6)} ${telefono.slice(6)}`
  }
  return telefono
}

function PerfilPage() {
  const { usuario, logout } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let activo = true

    obtenerPerfilApi()
      .then((datos) => {
        if (activo) setPerfil(datos)
      })
      .catch((err) => {
        if (activo) setError(err.mensajeUsuario)
      })

    return () => {
      activo = false
    }
  }, [intento])

  function reintentar() {
    setError('')
    setIntento((n) => n + 1)
  }

  const esCliente = usuario?.rol === 'CLIENTE'

  return (
    <div className={styles.pagina}>
      <header>
        <h1 className={styles.titulo}>Mi perfil</h1>
        <p className={styles.subtitulo}>
          Administra tu información, tu seguridad y cómo te contactamos.
        </p>
      </header>

      {error && (
        <div className={styles.estado} role="alert">
          <p>{error}</p>
          <button type="button" className={styles.botonSecundario} onClick={reintentar}>
            Reintentar
          </button>
        </div>
      )}

      {!perfil && !error && (
        <p className={styles.estado} aria-live="polite">
          Cargando tu perfil…
        </p>
      )}

      {perfil && (
        <div className={styles.cuadricula}>
          <div className={styles.columna}>
            <section className={styles.tarjeta} aria-labelledby="titulo-datos">
              <h2 id="titulo-datos" className={styles.tituloTarjeta}>Datos personales</h2>
              <p className={styles.descripcion}>Esta información aparece en tus pedidos y tickets.</p>

              <div className={styles.identidad}>
                <Avatar nombre={perfil.nombre} apellido={perfil.apellidoPat} tamano="grande" />
                <div>
                  <p className={styles.valor}>{perfil.nombre} {perfil.apellidoPat}</p>
                  <p className={styles.ayuda}>{NOMBRE_ROL[usuario?.rol]}</p>
                </div>
              </div>

              <dl className={styles.lista}>
                <div className={styles.fila}>
                  <div>
                    <dt className={styles.etiqueta}>Nombre</dt>
                    <dd className={styles.valor}>{nombreCompleto(perfil)}</dd>
                  </div>
                </div>

                <div className={styles.fila}>
                  <div>
                    <dt className={styles.etiqueta}>Correo electrónico</dt>
                    <dd className={styles.valor}>{perfil.correo}</dd>
                    <dd className={styles.ayuda}>Lo usas para iniciar sesión. No se puede cambiar.</dd>
                  </div>
                </div>

                <div className={styles.fila}>
                  <div>
                    <dt className={styles.etiqueta}>Teléfono</dt>
                    <dd className={styles.valor}>{formatearTelefono(perfil.telefono)}</dd>
                    <dd className={styles.ayuda}>Aquí te llega tu ticket digital por WhatsApp.</dd>
                  </div>
                </div>
              </dl>
            </section>

            <section className={styles.tarjeta} aria-labelledby="titulo-seguridad">
              <h2 id="titulo-seguridad" className={styles.tituloTarjeta}>Seguridad</h2>
              <p className={styles.descripcion}>
                Por seguridad, tu contraseña nunca se muestra; solo puedes cambiarla.
              </p>

              <dl className={styles.lista}>
                <div className={styles.fila}>
                  <div>
                    <dt className={styles.etiqueta}>Contraseña</dt>
                    <dd className={styles.valor}>••••••••••</dd>
                  </div>
                </div>
              </dl>
            </section>
          </div>

          <div className={styles.columna}>
            <section className={styles.tarjeta} aria-labelledby="titulo-notificaciones">
              <h2 id="titulo-notificaciones" className={styles.tituloTarjeta}>Notificaciones</h2>
              <p className={styles.descripcion}>Elige cómo quieres recibir tus tickets.</p>

              <p className={styles.subtituloSeccion}>Recibir mi ticket digital por</p>
              <div className={styles.chips}>
                {CANALES.map((canal) => {
                  const seleccionado = perfil.canalTicket === canal.valor
                  const Icono = seleccionado ? Check : canal.icono
                  return (
                    <span
                      key={canal.valor}
                      className={`${styles.chip} ${seleccionado ? styles.chipSeleccionado : ''}`}
                    >
                      <Icono size={16} aria-hidden="true" />
                      {canal.texto}
                    </span>
                  )
                })}
              </div>
            </section>

            {esCliente && (
              <section className={styles.tarjeta} aria-labelledby="titulo-actividad">
                <h2 id="titulo-actividad" className={styles.tituloTarjeta}>Mi actividad</h2>
                <p className={styles.descripcion}>Acceso rápido a lo que has hecho en Pizza Code.</p>

                <div className={styles.enlaces}>
                  <Link to="/cliente/historial" className={styles.enlace}>
                    <span className={styles.icono}><History size={18} aria-hidden="true" /></span>
                    <span className={styles.enlaceTexto}>
                      <span className={styles.valor}>Mis pedidos</span>
                      <span className={styles.ayuda}>Consulta el estado y el historial de tus pedidos.</span>
                    </span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>

                  <Link to="/cliente" className={styles.enlace}>
                    <span className={styles.icono}><MessageSquare size={18} aria-hidden="true" /></span>
                    <span className={styles.enlaceTexto}>
                      <span className={styles.valor}>Mis comentarios y sugerencias</span>
                      <span className={styles.ayuda}>Comenta y vota en la página de inicio.</span>
                    </span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </section>
            )}

            <section className={styles.tarjeta} aria-labelledby="titulo-opciones">
              <h2 id="titulo-opciones" className={`${styles.tituloTarjeta} ${styles.tituloPeligro}`}>
                Otras opciones
              </h2>
              <p className={styles.descripcion}>Acciones sobre tu sesión.</p>

              <div className={styles.fila}>
                <div>
                  <p className={styles.valor}>Cerrar sesión</p>
                  <p className={styles.ayuda}>Sal de tu cuenta en este dispositivo.</p>
                </div>
                <button type="button" className={styles.botonSecundario} onClick={logout}>
                  <LogOut size={16} aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerfilPage
