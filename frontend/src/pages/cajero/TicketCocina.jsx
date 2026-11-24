import { createPortal } from 'react-dom'
import styles from './TicketCocina.module.css'

const NOMBRE_ORIGEN = { SUCURSAL: 'Sucursal', EN_LINEA: 'En línea' }

function formatearFechaTicket(fecha) {
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return ''
  const dia = valor.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const hora = valor.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
  return `${dia} · ${hora}`
}

// Se pinta fuera de #root para que al imprimir solo salga el ticket
function TicketCocina({ pedido, descripciones = {} }) {
  const datos = [formatearFechaTicket(pedido.fecha), NOMBRE_ORIGEN[pedido.origen] ?? pedido.origen]
    .filter(Boolean)
    .join(' · ')

  return createPortal(
    <div className={styles.ticket} aria-hidden="true">
      <p className={styles.marca}>PIZZA CODE</p>
      <p className={styles.subtitulo}>TICKET DE COCINA</p>
      <hr className={styles.separador} />

      <p className={styles.numero}>#{pedido.idPedido}</p>
      <p className={styles.para}>Para: {pedido.nombreCliente || 'Mostrador'}</p>
      <p className={styles.datos}>{datos}</p>
      <hr className={styles.separador} />

      <ul className={styles.renglones}>
        {pedido.renglones.map((r) => (
          <li key={r.idProducto} className={styles.renglon}>
            <span className={styles.cantidad}>{r.cantidad} ×</span>
            <span>
              <span className={styles.producto}>{r.nombreProducto}</span>
              {descripciones[r.idProducto] && (
                <span className={styles.descripcion}>{descripciones[r.idProducto]}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <hr className={styles.separador} />

      <p className={styles.pie}>Pegar en la caja de la pizza</p>
    </div>,
    document.body,
  )
}

export default TicketCocina
