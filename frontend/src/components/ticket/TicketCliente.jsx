import { MapPin, MessageCircle } from 'lucide-react'
import { fechaCorta, hora } from '../../utils/fechas'
import { formatearMoneda } from '../../utils/moneda'
import { estadoPago } from '../../utils/pago'
import { etiquetaTamano, nombreBase } from '../../utils/productos'
import styles from './TicketCliente.module.css'

const TIPOS = { EN_LINEA: 'En línea · Recoger', SUCURSAL: 'En sucursal' }

// Ticket digital del cliente (diseño de Figma). Recibe el pedido de GET /pedidos/mis-pedidos/{id}.
// Es el mismo diseño que se usará para el correo y WhatsApp.
function TicketCliente({ pedido }) {
  const cancelado = pedido.estado === 'CANCELADO'
  const pagado = pedido.metodoPago === 'TARJETA'
  const anio = pedido.fecha.slice(0, 4)

  return (
    <article className={styles.ticket}>
      <header className={styles.encabezado}>
        <p className={styles.marca}>Pizza Code</p>
        <p className={styles.lema}>Ticket digital de tu pedido</p>
      </header>

      <div className={styles.cuerpo}>
        <h3 className={styles.saludo}>¡Gracias por tu pedido, {pedido.nombreCliente?.split(' ')[0] || 'cliente'}!</h3>
        <p className={styles.instruccion}>Muestra este ticket (o tu folio) al recoger tu pedido en sucursal.</p>

        {cancelado && (
          <p className={styles.cancelado}>
            Pedido cancelado{pedido.motivoCancelacion ? `: ${pedido.motivoCancelacion}` : ''}
          </p>
        )}

        <div className={styles.datos}>
          <div className={styles.dato}>
            <span className={styles.etiqueta}>Folio</span>
            <strong>#{pedido.idPedido}</strong>
          </div>
          <div className={styles.dato}>
            <span className={styles.etiqueta}>Fecha</span>
            <strong>{fechaCorta(pedido.fecha)} {anio} · {hora(pedido.fecha)}</strong>
          </div>
          <div className={styles.dato}>
            <span className={styles.etiqueta}>Tipo</span>
            <strong>{TIPOS[pedido.origen] ?? pedido.origen}</strong>
          </div>
          <div className={styles.dato}>
            <span className={styles.etiqueta}>Pago</span>
            <strong>{pagado ? 'Tarjeta' : 'Efectivo'}</strong>
            <small>{estadoPago(pedido)}</small>
          </div>
        </div>

        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Producto</th>
              <th className={styles.centro}>Cant.</th>
              <th className={styles.derecha}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {pedido.renglones.map((r) => (
              <tr key={r.idProducto}>
                <td>
                  <span className={styles.producto}>{nombreBase(r.nombreProducto)}</span>
                  {etiquetaTamano(r.nombreProducto) && (
                    <span className={styles.tamano}>{etiquetaTamano(r.nombreProducto)}</span>
                  )}
                </td>
                <td className={styles.centro}>{r.cantidad}</td>
                <td className={styles.derecha}>{formatearMoneda(r.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.total}>
          <span>Total</span>
          <span>{formatearMoneda(pedido.total)}</span>
        </div>

        <div className={styles.folioGrande}>
          <span className={styles.etiqueta}>Folio para recoger</span>
          <strong>{pedido.idPedido}</strong>
        </div>
      </div>

      <footer className={styles.pie}>
        <p><MapPin size={14} aria-hidden="true" /> Pizza Code – Sucursal Centro · Av. Juárez 123, Col. Centro</p>
        <p><MessageCircle size={14} aria-hidden="true" /> ¿Dudas con tu pedido? Muestra tu folio en sucursal.</p>
      </footer>
    </article>
  )
}

export default TicketCliente
