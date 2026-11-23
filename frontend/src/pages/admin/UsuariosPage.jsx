import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { KeyRound, Lock, Pencil, Plus, Search } from 'lucide-react'
import {
  desbloquearUsuario,
  listarUsuarios,
  obtenerResumenUsuarios,
} from '../../api/usuariosApi'
import { useAuth } from '../../auth/useAuth'
import Avatar from '../../components/ui/Avatar'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'
import Paginacion from '../../components/ui/Paginacion'
import { NOMBRE_ROL } from '../../components/layout/navegacion'
import { formatearTelefono } from '../../utils/telefono'
import ModalBloqueo from './ModalBloqueo'
import styles from './UsuariosPage.module.css'

const TAMANO_PAGINA = 8

const PESTANAS = [
  { valor: '', texto: 'Todos' },
  { valor: 'CLIENTE', texto: 'Clientes' },
  { valor: 'CAJERO', texto: 'Cajeros' },
  { valor: 'ADMIN', texto: 'Administradores' },
]

const CLASE_ROL = {
  ADMIN: styles.rolAdmin,
  CAJERO: styles.rolCajero,
  CLIENTE: styles.rolCliente,
}

function Dato({ etiqueta, valor }) {
  return (
    <div className={styles.dato}>
      <p className={styles.datoEtiqueta}>{etiqueta}</p>
      <p className={styles.datoValor}>{valor}</p>
    </div>
  )
}

function nombreCompleto(u) {
  return [u.nombre, u.apellidoPat, u.apellidoMat].filter(Boolean).join(' ')
}

function UsuariosPage() {
  const { usuario: actual } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [aviso, setAviso] = useState(location.state?.aviso ?? '')

  // El aviso llega del formulario; se borra del historial para que no reaparezca al recargar
  useEffect(() => {
    if (location.state?.aviso) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  const [usuarios, setUsuarios] = useState([])
  const [resumen, setResumen] = useState({ clientes: 0, cajeros: 0, administradores: 0, bloqueados: 0 })
  const [filtros, setFiltros] = useState({ rol: '', estado: '', busqueda: '' })
  const [pagina, setPagina] = useState(0)
  const [infoPagina, setInfoPagina] = useState({ totalPages: 0, totalElements: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)
  const [aBloquear, setABloquear] = useState(null)
  const [aDesbloquear, setADesbloquear] = useState(null)
  const [desbloqueando, setDesbloqueando] = useState(false)

  // Contadores de las tarjetas: los calcula el servidor
  useEffect(() => {
    obtenerResumenUsuarios()
      .then(setResumen)
      .catch(() => {})
  }, [recargar])

  // Tabla: cada cambio de filtro o de página pide SOLO esa página al servidor
  useEffect(() => {
    let vigente = true // ignora respuestas viejas si el usuario sigue escribiendo

    listarUsuarios({
      rol: filtros.rol || undefined,
      estado: filtros.estado || undefined,
      busqueda: filtros.busqueda.trim() || undefined,
      page: pagina,
      size: TAMANO_PAGINA,
    })
      .then((data) => {
        if (!vigente) return
        // Si la página se quedó vacía (por ejemplo, al bloquear al último de un filtro), regresa una
        if (data.content.length === 0 && pagina > 0) {
          setPagina(pagina - 1)
          return
        }
        setUsuarios(data.content)
        setInfoPagina(data.page)
        setError('')
        setCargando(false)
      })
      .catch((e) => {
        if (!vigente) return
        setError(e.mensajeUsuario)
        setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [filtros, pagina, recargar])

  function refrescar() {
    setCargando(true)
    setRecargar((n) => n + 1)
  }

  function cambiarFiltro(nombre, valor) {
    setCargando(true)
    setAviso('')
    setFiltros((actuales) => ({ ...actuales, [nombre]: valor }))
    setPagina(0) // al filtrar se vuelve a la primera página
  }

  function cambiarPagina(nueva) {
    setCargando(true)
    setPagina(nueva)
  }

  async function confirmarDesbloquear() {
    setDesbloqueando(true)
    try {
      await desbloquearUsuario(aDesbloquear.idUsuario)
      refrescar()
    } catch (e) {
      setError(e.mensajeUsuario)
    } finally {
      setDesbloqueando(false)
      setADesbloquear(null)
    }
  }

  const claseChip = (activo) => (activo ? `${styles.chip} ${styles.chipActivo}` : styles.chip)

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Usuarios</h1>
          <p className={styles.subtitulo}>Clientes y empleados del sistema.</p>
        </div>
        <Link to="/admin/usuarios/nuevo" className={styles.botonNuevo}>
          <Plus size={18} aria-hidden="true" />
          Nuevo empleado
        </Link>
      </header>

      <div className={styles.resumen}>
        <Dato etiqueta="Clientes" valor={resumen.clientes} />
        <Dato etiqueta="Cajeros" valor={resumen.cajeros} />
        <Dato etiqueta="Administradores" valor={resumen.administradores} />
        <Dato etiqueta="Bloqueados" valor={resumen.bloqueados} />
      </div>

      <div className={styles.tarjeta}>
        <div className={styles.barraFiltros}>
          <div className={styles.chips} role="group" aria-label="Filtrar por rol">
            {PESTANAS.map((p) => (
              <button
                key={p.valor || 'todos'}
                type="button"
                className={claseChip(filtros.rol === p.valor)}
                aria-pressed={filtros.rol === p.valor}
                onClick={() => cambiarFiltro('rol', p.valor)}
              >
                {p.texto}
              </button>
            ))}
          </div>

          <div className={styles.controles}>
            <label className={styles.buscador}>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar por nombre, correo o teléfono"
                aria-label="Buscar usuario por nombre, correo o teléfono"
                value={filtros.busqueda}
                onChange={(e) => cambiarFiltro('busqueda', e.target.value)}
              />
            </label>
            <select
              className={styles.selector}
              aria-label="Filtrar por estado"
              value={filtros.estado}
              onChange={(e) => cambiarFiltro('estado', e.target.value)}
            >
              <option value="">Estado: Todos</option>
              <option value="ACTIVO">Estado: Activos</option>
              <option value="BLOQUEADO">Estado: Bloqueados</option>
            </select>
          </div>
        </div>

        {aviso && (
          <p className={styles.aviso} role="status">
            {aviso}
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className={styles.derecha}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} className={styles.estado}>Cargando usuarios…</td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.estado}>No se encontraron usuarios.</td>
                </tr>
              ) : (
                usuarios.map((u) => {
                  const esYo = u.idUsuario === actual?.idUsuario
                  const bloqueado = u.estado === 'BLOQUEADO'
                  const nombre = nombreCompleto(u)

                  return (
                    <tr key={u.idUsuario}>
                      <td>
                        <div className={styles.usuario}>
                          <Avatar nombre={u.nombre} apellido={u.apellidoPat} />
                          <div className={styles.usuarioTexto}>
                            <p className={styles.nombre}>{nombre}</p>
                            <p className={styles.correo}>{u.correo}</p>
                            {bloqueado && u.motivoBloqueo && (
                              <p className={styles.motivo}>Motivo: {u.motivoBloqueo}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={styles.telefono}>{formatearTelefono(u.telefono)}</td>
                      <td>
                        <span className={`${styles.rol} ${CLASE_ROL[u.rol.nombre] ?? ''}`}>
                          {NOMBRE_ROL[u.rol.nombre] ?? u.rol.nombre}
                        </span>
                      </td>
                      <td>
                        <span className={bloqueado ? `${styles.estadoUsuario} ${styles.bloqueado}` : `${styles.estadoUsuario} ${styles.activo}`}>
                          {bloqueado ? 'Bloqueado' : 'Activo'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.acciones}>
                          <Link
                            to={`/admin/usuarios/${u.idUsuario}/editar`}
                            className={styles.botonEditar}
                            aria-label={`Editar a ${nombre}`}
                          >
                            <Pencil size={16} aria-hidden="true" />
                            Editar
                          </Link>
                          {esYo ? (
                            <span className={styles.tu}>Tú</span>
                          ) : bloqueado ? (
                            <button
                              type="button"
                              className={styles.botonDesbloquear}
                              aria-label={`Desbloquear a ${nombre}`}
                              onClick={() => setADesbloquear(u)}
                            >
                              <KeyRound size={16} aria-hidden="true" />
                              Desbloquear
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={styles.botonBloquear}
                              aria-label={`Bloquear a ${nombre}`}
                              onClick={() => setABloquear(u)}
                            >
                              <Lock size={16} aria-hidden="true" />
                              Bloquear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <Paginacion
          pagina={pagina}
          totalPaginas={infoPagina.totalPages}
          totalElementos={infoPagina.totalElements}
          tamano={TAMANO_PAGINA}
          onCambiar={cambiarPagina}
        />
      </div>

      {aBloquear && (
        <ModalBloqueo
          usuario={aBloquear}
          onCerrar={() => setABloquear(null)}
          onBloqueado={() => {
            setABloquear(null)
            refrescar()
          }}
        />
      )}

      <ModalConfirmacion
        abierto={aDesbloquear !== null}
        titulo="Desbloquear usuario"
        mensaje={`¿Desbloquear a ${aDesbloquear ? nombreCompleto(aDesbloquear) : ''}? Podrá volver a iniciar sesión.`}
        cargando={desbloqueando}
        onConfirmar={confirmarDesbloquear}
        onCancelar={() => setADesbloquear(null)}
      />
    </section>
  )
}

export default UsuariosPage
