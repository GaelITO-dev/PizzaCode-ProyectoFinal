import { Link, Navigate, useLocation } from 'react-router-dom'
import { Check, Clock, House, Mail, MessageCircle } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { formatearMoneda } from '../../utils/moneda'
import { formatearTelefono } from '../../utils/telefono'
import PasosCompra from './PasosCompra'
import styles from './PedidoConfirmadoPage.module.css'

// Texto de la franja verde según cómo pidió su ticket
function mensajeTicket(canal, telefono, correo) {
  const whatsapp = `por WhatsApp (${formatearTelefono(telefono)})`
  const email = `a tu correo (${correo})`
  if (canal === 'WHATSAPP') return `Te enviaremos tu ticket ${whatsapp}.`
  if (canal === 'CORREO') return `Te enviaremos tu ticket ${email}.`
  return `Te enviaremos tu ticket ${whatsapp} y ${email}.`
}

// Llega desde Pago con los datos del pedido en location.state
function PedidoConfirmadoPage() {
  const { state } = useLocation()
  const { usuario } = useAuth()

  // Si recargan la página ya no hay datos: se regresa al inicio
  if (!state?.pedido) return <Navigate to="/cliente" replace />

  const { pedido, canal, telefono, ultimos4 } = state
  const correo = state.correo ?? usuario?.correo

  return (
    <section className={styles.pagina}>
      <PasosCompra actual={3} />

      <div className={styles.tarjeta}>
        <span className={styles.icono}><Check size={32} aria-hidden="true" /></span>
        <h1 className={styles.titulo}>¡Pedido confirmado!</h1>
        <p className={styles.subtitulo}>Gracias, {usuario?.nombre}. Ya recibimos tu pedido.</p>

        <div className={styles.datos}>
          <div className={styles.dato}>
            <span className={styles.datoEtiqueta}>Folio</span>
            <strong>#{pedido.idPedido}</strong>
          </div>
          <div className={styles.dato}>
            <span className={styles.datoEtiqueta}>Pago</span>
            <strong>{pedido.metodoPago === 'TARJETA' ? `Tarjeta •••• ${ultimos4}` : 'Al recoger'}</strong>
            <small>{pedido.metodoPago === 'TARJETA' ? 'Pagado' : 'Pendiente'}</small>
          </div>
        </div>

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

        <p className={styles.ticket}>
          {canal !== 'CORREO' && <MessageCircle size={16} aria-hidden="true" />}
          {canal !== 'WHATSAPP' && <Mail size={16} aria-hidden="true" />}
          {mensajeTicket(canal, telefono, correo)}
        </p>

        <div className={styles.acciones}>
          <Link to="/cliente" className={styles.botonSecundario}>
            <House size={16} aria-hidden="true" /> Volver al inicio
          </Link>
          <Link to={`/cliente/historial/${pedido.idPedido}`} className={styles.botonPrincipal}>
            <Clock size={16} aria-hidden="true" /> Seguir mi pedido
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PedidoConfirmadoPage
