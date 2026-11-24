import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { listarPedidos } from '../../api/pedidosApi'
import { formatearMoneda } from '../../utils/moneda'
import { NOMBRE_ORIGEN, formatearHora, resumenProductos } from '../../utils/pedidos'
import Cargando from '../../components/ui/Cargando'
import styles from './TodosPedidosPage.module.css'

const TAMANO_PAGINA = 10

const ESTADOS = [
  { valor: 'RECIBIDO', nombre: 'Por imprimir', clase: styles.porImprimir },
  { valor: 'EN_PREPARACION', nombre: 'En preparación', clase: styles.enPreparacion },
  { valor: 'LISTO', nombre: 'Listo', clase: styles.listo },
  { valor: 'ENTREGADO', nombre: 'Entregado', clase: styles.entregado },
  { valor: 'CANCELADO', nombre: 'Cancelado', clase: styles.cancelado },
]

const ESTADO_POR_VALOR = Object.fromEntries(ESTADOS.map((e) => [e.valor, e]))

const METODOS_PAGO = [
  { valor: 'EFECTIVO', nombre: 'Efectivo' },
  { valor: 'TARJETA', nombre: 'Tarjeta' },
]

// #45 -> "#0045", como en el Figma
function formatearFolio(idPedido) {
  return `#${String(idPedido).padStart(4, '0')}`
}

// 5533445566 -> "55 3344 5566"
function formatearTelefono(telefono) {
  const digitos = String(telefono ?? '').replace(/\D/g, '')
  return digitos.length === 10 ? `${digitos.slice(0, 2)} ${digitos.slice(2, 6)} ${digitos.slice(6)}` : telefono
}

// "19 nov · 10:14 a. m."
function formatearFecha(fecha) {
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return ''
  const dia = valor.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '')
  return `${dia} · ${formatearHora(fecha)}`
}

// "2026-11-19" -> Date local (new Date("2026-11-19") la tomaría como UTC y podría dar el día anterior)
function fechaLocal(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

function fechaCorta(iso) {
  return fechaLocal(iso)
    .toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace('.', '')
}

// Texto del botón de fechas: "Todas las fechas", "1–19 nov 2026", "Desde 3 nov 2026"...
function etiquetaRango(desde, hasta) {
  if (!desde && !hasta) return 'Todas las fechas'
  if (desde && !hasta) return `Desde ${fechaCorta(desde)}`
  if (!desde && hasta) return `Hasta ${fechaCorta(hasta)}`

  const inicio = fechaLocal(desde)
  const fin = fechaLocal(hasta)
  if (inicio.getFullYear() === fin.getFullYear() && inicio.getMonth() === fin.getMonth()) {
    const mes = fin.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '')
    return `${inicio.getDate()}–${fin.getDate()} ${mes} ${fin.getFullYear()}`
  }
  return `${fechaCorta(desde)} – ${fechaCorta(hasta)}`
}

// Hasta 5 botones de página alrededor de la actual (base 0)
function paginasVisibles(actual, total) {
  const cantidad = Math.min(5, total)
  const inicio = Math.min(Math.max(0, actual - 2), total - cantidad)
  return Array.from({ length: cantidad }, (_, i) => inicio + i)
}

export default function TodosPedidosPage() {
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [estado, setEstado] = useState('')
  const [origen, setOrigen] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [mostrarFechas, setMostrarFechas] = useState(false)
  const [pagina, setPagina] = useState(0)
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [fallo, setFallo] = useState(null)

  // Espera 300 ms después de la última tecla para no consultar al servidor en cada letra
  useEffect(() => {
    const texto = busqueda.trim()
    if (texto === busquedaAplicada) return undefined
    const temporizador = setTimeout(() => {
      setBusquedaAplicada(texto)
      setPagina(0)
    }, 300)
    return () => clearTimeout(temporizador)
  }, [busqueda, busquedaAplicada])

  // Solo se mandan los filtros que tienen valor
  const consulta = useMemo(() => {
    const params = { page: pagina, size: TAMANO_PAGINA }
    if (estado) params.estado = estado
    if (origen) params.origen = origen
    if (metodoPago) params.metodoPago = metodoPago
    if (busquedaAplicada) params.busqueda = busquedaAplicada
    if (desde) params.desde = desde
    if (hasta) params.hasta = hasta
    return params
  }, [pagina, estado, origen, metodoPago, busquedaAplicada, desde, hasta])

  useEffect(() => {
    let vigente = true
    listarPedidos(consulta)
      .then((datos) => {
        if (vigente) setResultado({ consulta, datos })
      })
      .catch((error) => {
        if (vigente) {
          setFallo({ consulta, intento, mensaje: error.mensajeUsuario ?? 'No se pudieron cargar los pedidos.' })
        }
      })
    return () => {
      vigente = false
    }
  }, [consulta, intento])

  // Mientras llega la consulta nueva se sigue mostrando la anterior, atenuada
  const alDia = resultado?.consulta === consulta
  const hayError = !alDia && fallo?.consulta === consulta && fallo.intento === intento
  const datos = resultado?.datos
  const pedidos = datos?.content ?? []
  const info = datos?.page
  const primero = info ? info.number * info.size + 1 : 0
  const ultimo = info ? info.number * info.size + pedidos.length : 0

  const hayFiltros = Boolean(busqueda || estado || origen || metodoPago || desde || hasta)

  // Cualquier filtro nuevo regresa a la página 1
  function alCambiar(setter) {
    return (evento) => {
      setter(evento.target.value)
      setPagina(0)
    }
  }

  function limpiarFiltros() {
    setBusqueda('')
    setBusquedaAplicada('')
    setEstado('')
    setOrigen('')
    setMetodoPago('')
    setDesde('')
    setHasta('')
    setPagina(0)
  }

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Todos los pedidos</h1>
          <p className={styles.subtitulo}>Pedidos de sucursal y en línea, de todas las fechas.</p>
        </div>

        <div className={styles.rangoContenedor}>
          <button
            type="button"
            className={styles.botonRango}
            onClick={() => setMostrarFechas((abierto) => !abierto)}
            aria-expanded={mostrarFechas}
          >
            <CalendarDays size={16} aria-hidden="true" />
            {etiquetaRango(desde, hasta)}
          </button>

          {mostrarFechas && (
            <div className={styles.panelFechas}>
              <label className={styles.campoFecha}>
                Desde
                <input type="date" value={desde} max={hasta || undefined} onChange={alCambiar(setDesde)} />
              </label>
              <label className={styles.campoFecha}>
                Hasta
                <input type="date" value={hasta} min={desde || undefined} onChange={alCambiar(setHasta)} />
              </label>
              <button type="button" className={styles.botonListo} onClick={() => setMostrarFechas(false)}>
                Listo
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.barraFiltros}>
        <label className={styles.buscador}>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por folio, cliente o teléfono"
            aria-label="Buscar por folio, cliente o teléfono"
          />
        </label>

        <label className={styles.filtro}>
          <span>Estado:</span>
          <select value={estado} onChange={alCambiar(setEstado)}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filtro}>
          <span>Origen:</span>
          <select value={origen} onChange={alCambiar(setOrigen)}>
            <option value="">Todos</option>
            {Object.entries(NOMBRE_ORIGEN).map(([valor, nombre]) => (
              <option key={valor} value={valor}>
                {nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filtro}>
          <span>Pago:</span>
          <select value={metodoPago} onChange={alCambiar(setMetodoPago)}>
            <option value="">Todos</option>
            {METODOS_PAGO.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.nombre}
              </option>
            ))}
          </select>
        </label>

        {hayFiltros && (
          <button type="button" className={styles.limpiar} onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {hayError ? (
        <div className={styles.estado}>
          <p className={styles.error}>{fallo.mensaje}</p>
          <button type="button" className={styles.botonSecundario} onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      ) : !datos ? (
        <p className={styles.estado}><Cargando texto="Cargando pedidos…" /></p>
      ) : (
        <div className={`${styles.tarjeta} ${alDia ? '' : styles.actualizando}`}>
          {pedidos.length === 0 ? (
            <p className={styles.vacio}>No hay pedidos con estos filtros.</p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Cliente</th>
                      <th>Origen</th>
                      <th>Productos</th>
                      <th className={styles.derecha}>Total</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((pedido) => {
                      const infoEstado = ESTADO_POR_VALOR[pedido.estado]
                      const productos = resumenProductos(pedido.productos)
                      return (
                        <tr key={pedido.idPedido}>
                          <td className={styles.folio}>{formatearFolio(pedido.idPedido)}</td>
                          <td>
                            <span className={styles.cliente}>{pedido.nombreCliente || 'Cliente de mostrador'}</span>
                            {pedido.telefonoCliente && (
                              <span className={styles.telefono}>{formatearTelefono(pedido.telefonoCliente)}</span>
                            )}
                          </td>
                          <td>
                            <span className={styles.origen}>{NOMBRE_ORIGEN[pedido.origen] ?? pedido.origen}</span>
                          </td>
                          <td>
                            <span className={styles.productos} title={productos}>
                              {productos}
                            </span>
                          </td>
                          <td className={`${styles.derecha} ${styles.total}`}>{formatearMoneda(pedido.total)}</td>
                          <td>
                            <span
                              className={`${styles.insignia} ${infoEstado?.clase ?? ''}`}
                              title={pedido.motivoCancelacion ?? undefined}
                            >
                              {infoEstado?.nombre ?? pedido.estado}
                            </span>
                          </td>
                          <td className={styles.fecha}>{formatearFecha(pedido.fecha)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <footer className={styles.pie}>
                <p className={styles.conteo}>
                  Mostrando {primero}–{ultimo} de {info.totalElements} pedidos
                </p>

                {info.totalPages > 1 && (
                  <nav className={styles.paginacion} aria-label="Paginación">
                    <button
                      type="button"
                      className={styles.botonPagina}
                      onClick={() => setPagina((p) => p - 1)}
                      disabled={pagina === 0}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>

                    {paginasVisibles(pagina, info.totalPages).map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.botonPagina} ${n === pagina ? styles.paginaActiva : ''}`}
                        onClick={() => setPagina(n)}
                        aria-current={n === pagina ? 'page' : undefined}
                      >
                        {n + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      className={styles.botonPagina}
                      onClick={() => setPagina((p) => p + 1)}
                      disabled={pagina >= info.totalPages - 1}
                      aria-label="Página siguiente"
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </footer>
            </>
          )}
        </div>
      )}
    </section>
  )
}
