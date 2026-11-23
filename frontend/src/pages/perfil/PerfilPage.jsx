import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, History, Lock, LogOut, MessageSquare, Pencil } from 'lucide-react'
import { actualizarPerfilApi, obtenerPerfilApi } from '../../api/perfilApi'
import { useAuth } from '../../auth/useAuth'
import Avatar from '../../components/ui/Avatar'
import { NOMBRE_ROL } from '../../components/layout/navegacion'
import EditarNombre from './EditarNombre'
import EditarTelefono from './EditarTelefono'
import SelectorCanal from './SelectorCanal'
import CambiarContrasena from './CambiarContrasena'
import styles from './PerfilPage.module.css'

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
  const { usuario, logout, actualizarUsuario } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const [editando, setEditando] = useState(null)
  const [aviso, setAviso] = useState('')
  const [avisoContrasena, setAvisoContrasena] = useState('')

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

  function iniciarEdicion(campo) {
    setAviso('')
    setAvisoContrasena('')
    setEditando(campo)
  }

  function cancelarEdicion() {
    setEditando(null)
  }

  async function guardarCambios(cambios) {
    const actualizado = await actualizarPerfilApi(cambios)
    setPerfil(actualizado)
    actualizarUsuario({
      nombre: actualizado.nombre,
      apellidoPat: actualizado.apellidoPat,
    })
  }

  async function guardarCampo(cambios) {
    await guardarCambios(cambios)
    setEditando(null)
    setAviso('Tus datos se guardaron correctamente.')
  }

  function terminarCambioContrasena() {
    setEditando(null)
    setAvisoContrasena('Tu contraseña se cambió correctamente.')
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

              <div className={styles.lista}>
                <div className={styles.fila}>
                  {editando === 'nombre' ? (
                    <EditarNombre perfil={perfil} alGuardar={guardarCampo} alCancelar={cancelarEdicion} />
                  ) : (
                    <>
                      <div>
                        <p className={styles.etiqueta}>Nombre</p>
                        <p className={styles.valor}>{nombreCompleto(perfil)}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.botonSecundario}
                        onClick={() => iniciarEdicion('nombre')}
                        aria-label="Editar nombre"
                      >
                        <Pencil size={16} aria-hidden="true" />
                        Editar
                      </button>
                    </>
                  )}
                </div>

                <div className={styles.fila}>
                  <div>
                    <p className={styles.etiqueta}>Correo electrónico</p>
                    <p className={styles.valor}>{perfil.correo}</p>
                    <p className={styles.ayuda}>Lo usas para iniciar sesión. No se puede cambiar.</p>
                  </div>
                </div>

                <div className={styles.fila}>
                  {editando === 'telefono' ? (
                    <EditarTelefono
                      telefonoActual={perfil.telefono}
                      alGuardar={guardarCampo}
                      alCancelar={cancelarEdicion}
                    />
                  ) : (
                    <>
                      <div>
                        <p className={styles.etiqueta}>Teléfono</p>
                        <p className={styles.valor}>{formatearTelefono(perfil.telefono)}</p>
                        <p className={styles.ayuda}>Aquí te llega tu ticket digital por WhatsApp.</p>
                      </div>
                      <button
                        type="button"
                        className={styles.botonSecundario}
                        onClick={() => iniciarEdicion('telefono')}
                        aria-label="Editar teléfono"
                      >
                        <Pencil size={16} aria-hidden="true" />
                        Editar
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className={styles.aviso} aria-live="polite">{aviso}</p>
            </section>

            <section className={styles.tarjeta} aria-labelledby="titulo-seguridad">
              <h2 id="titulo-seguridad" className={styles.tituloTarjeta}>Seguridad</h2>
              <p className={styles.descripcion}>
                Por seguridad, tu contraseña nunca se muestra; solo puedes cambiarla.
              </p>

              <div className={styles.lista}>
                <div className={styles.fila}>
                  <div>
                    <p className={styles.etiqueta}>Contraseña</p>
                    <p className={`${styles.valor} ${styles.secreto}`} aria-label="Contraseña oculta">
                      ••••••••••
                    </p>
                  </div>
                  {editando !== 'contrasena' && (
                    <button
                      type="button"
                      className={styles.botonSecundario}
                      onClick={() => iniciarEdicion('contrasena')}
                      aria-label="Cambiar contraseña"
                    >
                      <Lock size={16} aria-hidden="true" />
                      Cambiar
                    </button>
                  )}
                </div>
              </div>

              {editando === 'contrasena' && (
                <CambiarContrasena alCancelar={cancelarEdicion} alTerminar={terminarCambioContrasena} />
              )}

              <p className={styles.aviso} aria-live="polite">{avisoContrasena}</p>
            </section>
          </div>

          <div className={styles.columna}>
            <section className={styles.tarjeta} aria-labelledby="titulo-notificaciones">
              <h2 id="titulo-notificaciones" className={styles.tituloTarjeta}>Notificaciones</h2>
              <p className={styles.descripcion}>Elige cómo quieres recibir tus tickets.</p>

              <p id="etiqueta-canal" className={styles.subtituloSeccion}>Recibir mi ticket digital por</p>
              <SelectorCanal
                valor={perfil.canalTicket}
                alCambiar={guardarCambios}
                idEtiqueta="etiqueta-canal"
              />
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
