import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Search, Tag, Trash2 } from 'lucide-react'
import { listarPromociones, contarPromociones, eliminarPromocion } from '../../api/promocionesApi'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'
import Paginacion from '../../components/ui/Paginacion'
import { rangoFechas } from '../../utils/fechas'
import base from './ProductosPage.module.css'
import Cargando from '../../components/ui/Cargando'
import styles from './PromocionesPage.module.css'

const TAMANO_PAGINA = 6

const FILTROS_ESTADO = [
  { valor: 'VIGENTE', texto: 'Vigentes' },
  { valor: 'PROGRAMADA', texto: 'Programadas' },
  { valor: 'TERMINADA', texto: 'Terminadas' },
  { valor: '', texto: 'Todas' },
]

const TEXTO_ESTADO = { VIGENTE: 'Vigente', PROGRAMADA: 'Programada', TERMINADA: 'Terminada' }

// "Pepperoni grande, Hawaiana grande y 4 más"
function resumenProductos(nombres) {
  if (nombres.length <= 2) return nombres.join(', ')
  return `${nombres.slice(0, 2).join(', ')} y ${nombres.length - 2} más`
}

function PromocionesPage() {
  const navegar = useNavigate()
  const [promociones, setPromociones] = useState([])
  const [resumen, setResumen] = useState({ vigentes: 0, programadas: 0, terminadas: 0 })
  const [estado, setEstado] = useState('')
  const [nombre, setNombre] = useState('')
  const [pagina, setPagina] = useState(0)
  const [infoPagina, setInfoPagina] = useState({ totalPages: 0, totalElements: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // Tarjetas de resumen (las cuenta el servidor)
  useEffect(() => {
    Promise.all([contarPromociones('VIGENTE'), contarPromociones('PROGRAMADA'), contarPromociones('TERMINADA')])
      .then(([vigentes, programadas, terminadas]) => setResumen({ vigentes, programadas, terminadas }))
      .catch(() => {})
  }, [recargar])

  // Tabla: filtros y paginación del servidor
  useEffect(() => {
    let vigente = true
    listarPromociones({
      estado: estado || undefined,
      nombre: nombre || undefined,
      page: pagina,
      size: TAMANO_PAGINA,
      sort: 'fechaInicio,desc',
    })
      .then((data) => {
        if (!vigente) return
        setPromociones(data.content)
        setInfoPagina(data.page)
        setError('')
      })
      .catch((e) => vigente && setError(e.mensajeUsuario))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [estado, nombre, pagina, recargar])

  function cambiarEstado(valor) {
    setCargando(true)
    setEstado(valor)
    setPagina(0)
  }

  function cambiarNombre(valor) {
    setCargando(true)
    setNombre(valor)
    setPagina(0)
  }

  function cambiarPagina(nueva) {
    setCargando(true)
    setPagina(nueva)
  }

  async function confirmarEliminar() {
    setEliminando(true)
    try {
      await eliminarPromocion(aEliminar.idPromocion)
      setCargando(true)
      setRecargar((n) => n + 1)
    } catch (e) {
      setError(e.mensajeUsuario)
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  const claseChip = (activo) => (activo ? `${base.chip} ${base.chipActivo}` : base.chip)

  return (
    <section className={base.pagina}>
      <header className={base.encabezado}>
        <div>
          <h1 className={base.titulo}>Promociones</h1>
          <p className={base.subtitulo}>Crea descuentos, define sus fechas y elige a qué productos aplican.</p>
        </div>
        <button type="button" className={base.botonNuevo} onClick={() => navegar('/admin/promociones/nueva')}>
          <Plus size={18} aria-hidden="true" />
          Nueva promoción
        </button>
      </header>

      <div className={`${base.resumen} ${styles.resumenTres}`}>
        <div className={base.dato}>
          <p className={base.datoEtiqueta}>Vigentes</p>
          <p className={base.datoValor}>{resumen.vigentes}</p>
        </div>
        <div className={base.dato}>
          <p className={base.datoEtiqueta}>Programadas</p>
          <p className={base.datoValor}>{resumen.programadas}</p>
        </div>
        <div className={base.dato}>
          <p className={base.datoEtiqueta}>Terminadas</p>
          <p className={base.datoValor}>{resumen.terminadas}</p>
        </div>
      </div>

      <div className={base.tarjeta}>
        <div className={styles.barra}>
          <div className={`${base.chips} ${styles.sinMargen}`}>
            {FILTROS_ESTADO.map((f) => (
              <button
                key={f.texto}
                type="button"
                className={claseChip(estado === f.valor)}
                onClick={() => cambiarEstado(f.valor)}
              >
                {f.texto}
              </button>
            ))}
          </div>
          <label className={`${base.buscador} ${styles.buscadorCorto}`}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar promoción"
              aria-label="Buscar promoción por nombre"
              value={nombre}
              onChange={(e) => cambiarNombre(e.target.value)}
            />
          </label>
        </div>

        {error && <p className={base.error} role="alert">{error}</p>}

        <div className={base.tablaContenedor}>
          <table className={base.tabla}>
            <thead>
              <tr>
                <th>Promoción</th>
                <th>Descuento</th>
                <th>Vigencia</th>
                <th>Aplica a</th>
                <th>Estado</th>
                <th className={base.derecha}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} className={base.estado}><Cargando texto="Cargando promociones..." /></td>
                </tr>
              ) : promociones.length === 0 ? (
                <tr>
                  <td colSpan={6} className={base.estado}>No se encontraron promociones.</td>
                </tr>
              ) : (
                promociones.map((p) => (
                  <tr key={p.idPromocion} className={p.estado === 'TERMINADA' ? styles.filaTerminada : undefined}>
                    <td>
                      <div className={base.producto}>
                        <span className={styles.icono} aria-hidden="true">
                          <Tag size={18} />
                        </span>
                        <div>
                          <p className={base.nombre}>{p.nombre}</p>
                          <p className={base.descripcion}>{resumenProductos(p.nombresProductos)}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.descuento}>{Number(p.descuento)}%</span>
                    </td>
                    <td className={styles.secundario}>{rangoFechas(p.fechaInicio, p.fechaFin)}</td>
                    <td className={styles.secundario}>
                      {p.idsProductos.length} {p.idsProductos.length === 1 ? 'producto' : 'productos'}
                    </td>
                    <td>
                      <span className={`${styles.estadoPromo} ${styles[p.estado]}`}>{TEXTO_ESTADO[p.estado]}</span>
                    </td>
                    <td>
                      <div className={base.acciones}>
                        <button
                          type="button"
                          className={base.botonEditar}
                          onClick={() => navegar(`/admin/promociones/${p.idPromocion}/editar`)}
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          className={base.botonEliminar}
                          aria-label={`Eliminar ${p.nombre}`}
                          onClick={() => setAEliminar(p)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      <ModalConfirmacion
        abierto={aEliminar !== null}
        titulo="Eliminar promoción"
        mensaje={`¿Seguro que quieres eliminar "${aEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  )
}

export default PromocionesPage
