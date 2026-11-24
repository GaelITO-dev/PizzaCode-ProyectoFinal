import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Clock, Plus, Receipt, Search } from 'lucide-react'
import { listarMisPedidos } from '../../api/pedidosClienteApi'
import Paginacion from '../../components/ui/Paginacion'
import VerTicketModal from '../../components/ticket/VerTicketModal'
import { fechaCorta, hora } from '../../utils/fechas'
import { formatearMoneda } from '../../utils/moneda'
import Cargando from '../../components/ui/Cargando'
import styles from './MisPedidosPage.module.css'

const TAMANO_PAGINA = 5

const FILTROS = [
  { valor: '', texto: 'Todos' },
  { valor: 'EN_CURSO', texto: 'En curso' },
  { valor: 'ENTREGADO', texto: 'Entregados' },
  { valor: 'CANCELADO', texto: 'Cancelados' },
]

const ETIQUETAS = {
  RECIBIDO: 'Recibido',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const EN_CURSO = ['RECIBIDO', 'EN_PREPARACION', 'LISTO']

// "Pepperoni grande (2), Refresco 2L (1)"
function resumenProductos(productos = []) {
  return productos.map((p) => `${p.nombreProducto} (${p.cantidad})`).join(', ')
}

function MisPedidosPage() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [filtros, setFiltros] = useState({ filtro: '', buscar: '' })
  const [pagina, setPagina] = useState(0)
  const [infoPagina, setInfoPagina] = useState({ totalPages: 0, totalElements: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ticket, setTicket] = useState(null) // id del pedido cuyo ticket se está viendo

  // El servidor filtra por estado y por folio/producto, y regresa solo la página pedida
  useEffect(() => {
    let vigente = true
    listarMisPedidos({
      filtro: filtros.filtro || undefined,
      buscar: filtros.buscar || undefined,
      page: pagina,
      size: TAMANO_PAGINA,
    })
      .then((data) => {
        if (!vigente) return
        setPedidos(data.content)
        setInfoPagina(data.page)
        setError('')
      })
      .catch((e) => vigente && setError(e.mensajeUsuario))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [filtros, pagina])

  function cambiarFiltro(nombre, valor) {
    setCargando(true)
    setFiltros({ ...filtros, [nombre]: valor })
    setPagina(0)
  }

  function cambiarPagina(nueva) {
    setCargando(true)
    setPagina(nueva)
  }

  const claseChip = (activo) => (activo ? `${styles.chip} ${styles.chipActivo}` : styles.chip)

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Mis pedidos</h1>
          <p className={styles.subtitulo}>Tus pedidos actuales y anteriores.</p>
        </div>
        <Link to="/cliente" className={styles.botonNuevo}>
          <Plus size={18} aria-hidden="true" /> Nuevo pedido
        </Link>
      </header>

      <div className={styles.barra}>
        <div className={styles.chips}>
          {FILTROS.map((f) => (
            <button key={f.valor} type="button" className={claseChip(filtros.filtro === f.valor)} onClick={() => cambiarFiltro('filtro', f.valor)}>
              {f.texto}
            </button>
          ))}
        </div>
        <label className={styles.buscador}>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por folio o producto"
            aria-label="Buscar pedido por folio o producto"
            value={filtros.buscar}
            onChange={(e) => cambiarFiltro('buscar', e.target.value)}
          />
        </label>
      </div>

      <div className={styles.tarjeta}>
        <h2 className={styles.tarjetaTitulo}>Pedidos</h2>

        {error && <p className={styles.error} role="alert">{error}</p>}

        {cargando ? (
          <p className={styles.estado}><Cargando texto="Cargando pedidos..." /></p>
        ) : pedidos.length === 0 ? (
          <p className={styles.estado}>No se encontraron pedidos.</p>
        ) : (
          <ul className={styles.lista}>
            {pedidos.map((p) => {
              const enCurso = EN_CURSO.includes(p.estado)
              return (
                <li key={p.idPedido} className={styles.renglon}>
                  <div className={styles.folio}>
                    <strong>#{p.idPedido}</strong>
                    <span>{fechaCorta(p.fecha)} · {hora(p.fecha)}</span>
                  </div>
                  <p className={styles.productos}>{resumenProductos(p.productos)}</p>
                  <span className={`${styles.insignia} ${styles[p.estado]}`}>{ETIQUETAS[p.estado]}</span>
                  <strong className={styles.total}>{formatearMoneda(p.total)}</strong>
                  {enCurso ? (
                    <button type="button" className={`${styles.accion} ${styles.accionPrincipal}`} onClick={() => navigate(`/cliente/historial/${p.idPedido}`)}>
                      <Clock size={16} aria-hidden="true" /> Seguir pedido
                    </button>
                  ) : (
                    <button type="button" className={styles.accion} onClick={() => setTicket(p.idPedido)}>
                      <Receipt size={16} aria-hidden="true" /> Ver ticket
                    </button>
                  )}
                  <Link to={`/cliente/historial/${p.idPedido}`} className={styles.ver} aria-label={`Ver detalle del pedido ${p.idPedido}`}>
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <Paginacion
          pagina={pagina}
          totalPaginas={infoPagina.totalPages}
          totalElementos={infoPagina.totalElements}
          tamano={TAMANO_PAGINA}
          onCambiar={cambiarPagina}
        />
      </div>

      {ticket && <VerTicketModal idPedido={ticket} onCerrar={() => setTicket(null)} />}
    </section>
  )
}

export default MisPedidosPage
