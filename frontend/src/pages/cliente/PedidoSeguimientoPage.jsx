import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, Flame, House, MapPin, Receipt, ShoppingBag, Store, X } from 'lucide-react'
import { obtenerMiPedido } from '../../api/pedidosClienteApi'
import VerTicketModal from '../../components/ticket/VerTicketModal'
import { fechaNumerica, hora } from '../../utils/fechas'
import { formatearMoneda } from '../../utils/moneda'
import { estadoPago } from '../../utils/pago'
import styles from './PedidoSeguimientoPage.module.css'

const PASOS = [
  { estado: 'RECIBIDO', texto: 'Recibido', icono: Check },
  { estado: 'EN_PREPARACION', texto: 'En preparación', icono: Flame },
  { estado: 'LISTO', texto: 'Listo', icono: ShoppingBag },
  { estado: 'ENTREGADO', texto: 'Entregado', icono: House },
]

const TITULOS = {
  RECIBIDO: 'Recibimos tu pedido',
  EN_PREPARACION: 'Tu pizza está en el horno',
  LISTO: '¡Tu pedido está listo!',
  ENTREGADO: 'Pedido entregado',
  CANCELADO: 'Pedido cancelado',
}

const AVISOS = {
  RECIBIDO: 'Te avisamos por SMS cuando esté listo.',
  EN_PREPARACION: 'Te avisamos por SMS cuando esté listo.',
  LISTO: 'Ya puedes pasar a recogerlo a la sucursal.',
  ENTREGADO: '¡Gracias por tu compra! Buen provecho.',
}

const ETIQUETAS = {
  RECIBIDO: 'Recibido',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const CADA_CUANTO_MS = 20000 // se vuelve a consultar el estado cada 20 s

function PedidoSeguimientoPage() {
  const { id } = useParams()
  return <PedidoSeguimiento key={id} id={id} />
}

function PedidoSeguimiento({ id }) {
  const [pedido, setPedido] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [verTicket, setVerTicket] = useState(false)

  // Carga el pedido y lo vuelve a pedir cada 20 s, así el cliente ve cuando el cajero cambia el estado
  useEffect(() => {
    let vigente = true
    function cargar() {
      obtenerMiPedido(id)
        .then((data) => {
          if (!vigente) return
          setPedido(data)
          setError('')
        })
        .catch((e) => vigente && setError(e.mensajeUsuario))
        .finally(() => vigente && setCargando(false))
    }
    cargar()
    const intervalo = setInterval(cargar, CADA_CUANTO_MS)
    return () => {
      vigente = false
      clearInterval(intervalo)
    }
  }, [id])

  if (cargando) return <p className={styles.estado}>Cargando pedido...</p>
  if (!pedido) {
    return (
      <div className={styles.estado}>
        <p className={styles.error} role="alert">{error || 'No se encontró el pedido.'}</p>
        <Link to="/cliente/historial" className={styles.volver}>
          <ArrowLeft size={16} aria-hidden="true" /> Mis pedidos
        </Link>
      </div>
    )
  }

  const cancelado = pedido.estado === 'CANCELADO'
  const indiceActual = PASOS.findIndex((p) => p.estado === pedido.estado)

  return (
    <section className={styles.pagina}>
      <Link to="/cliente/historial" className={styles.volver}>
        <ArrowLeft size={16} aria-hidden="true" /> Mis pedidos
      </Link>

      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Pedido #{pedido.idPedido}</h1>
          <p className={styles.subtitulo}>
            Hecho el {fechaNumerica(pedido.fecha)} a las {hora(pedido.fecha)} · Recoger en sucursal
          </p>
        </div>
        <span className={`${styles.insignia} ${styles[pedido.estado]}`}>{ETIQUETAS[pedido.estado]}</span>
      </header>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.columnas}>
        <div className={styles.columnaPrincipal}>
          <div className={styles.tarjeta}>
            <h2 className={styles.tarjetaTitulo}>{TITULOS[pedido.estado]}</h2>

            {cancelado ? (
              <p className={styles.cancelado}>
                <X size={16} aria-hidden="true" />
                {pedido.motivoCancelacion ? `Motivo: ${pedido.motivoCancelacion}` : 'Tu pedido fue cancelado.'}
              </p>
            ) : (
              <>
                <p className={styles.aviso}>{AVISOS[pedido.estado]}</p>
                <ol className={styles.pasos}>
                  {PASOS.map((paso, i) => {
                    const Icono = paso.icono
                    const clase = i < indiceActual ? styles.hecho : i === indiceActual ? styles.actual : styles.pendiente
                    return (
                      <li key={paso.estado} className={`${styles.paso} ${clase}`} aria-current={i === indiceActual ? 'step' : undefined}>
                        <span className={styles.circulo}>
                          <Icono size={18} aria-hidden="true" />
                        </span>
                        <span className={styles.pasoTexto}>{paso.texto}</span>
                        <span className={styles.pasoHora}>{i === 0 ? hora(pedido.fecha) : '—'}</span>
                      </li>
                    )
                  })}
                </ol>
              </>
            )}
          </div>

          <div className={styles.tarjeta}>
            <h2 className={styles.tarjetaTitulo}>Productos</h2>
            <ul className={styles.productos}>
              {pedido.renglones.map((r) => (
                <li key={r.idProducto}>
                  <span>{r.cantidad} × {r.nombreProducto}</span>
                  <span>{formatearMoneda(r.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.total}>
              <span>Total</span>
              <span>{formatearMoneda(pedido.total)}</span>
            </div>
          </div>
        </div>

        <aside className={styles.columnaLateral}>
          <div className={styles.tarjeta}>
            <h2 className={styles.tarjetaTitulo}>Recoges en</h2>
            <p className={styles.dato}><Store size={16} aria-hidden="true" /> Pizza Code – Sucursal Centro</p>
            <p className={styles.dato}><MapPin size={16} aria-hidden="true" /> Av. Juárez 123, Col. Centro</p>
          </div>

          <div className={styles.tarjeta}>
            <h2 className={styles.tarjetaTitulo}>Pago</h2>
            <div className={styles.pago}>
              <span className={styles.dato}>
                {pedido.metodoPago === 'TARJETA' ? <CreditCard size={16} aria-hidden="true" /> : <Store size={16} aria-hidden="true" />}
                {pedido.metodoPago === 'TARJETA' ? 'Tarjeta' : 'Al recoger'}
              </span>
              <span className={estadoPago(pedido) === 'Pagado' ? styles.pagado : styles.pendientePago}>
                {estadoPago(pedido)}
              </span>
            </div>
          </div>

          <div className={styles.tarjeta}>
            <h2 className={styles.tarjetaTitulo}>Tu ticket</h2>
            <p className={styles.folio}>Folio #{pedido.idPedido}</p>
            <button type="button" className={styles.botonTicket} onClick={() => setVerTicket(true)}>
              <Receipt size={16} aria-hidden="true" /> Ver ticket
            </button>
          </div>
        </aside>
      </div>

      {verTicket && <VerTicketModal idPedido={pedido.idPedido} onCerrar={() => setVerTicket(false)} />}
    </section>
  )
}

export default PedidoSeguimientoPage
