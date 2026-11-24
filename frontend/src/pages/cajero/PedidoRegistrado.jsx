import { Link } from 'react-router-dom'
import { Check, Clock, Plus, Printer } from 'lucide-react'
import { formatearMoneda } from '../../utils/moneda'
import { imprimirTicket } from '../../utils/impresion'
import TicketCocina from './TicketCocina'
import styles from './PedidoRegistrado.module.css'

const NOMBRE_METODO = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta' }

function PedidoRegistrado({ pedido, cambio, descripciones, onNuevo }) {
  const datos = [pedido.nombreCliente, NOMBRE_METODO[pedido.metodoPago], `Total ${formatearMoneda(pedido.total)}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className={styles.contenedor} aria-labelledby="titulo-registrado">
      <div className={styles.tarjeta}>
        <span className={styles.icono} aria-hidden="true">
          <Check size={32} />
        </span>
        <h1 id="titulo-registrado" className={styles.titulo}>
          Pedido #{pedido.idPedido} registrado
        </h1>
        <p className={styles.datos}>{datos}</p>

        {cambio !== null && (
          <div className={styles.cambio}>
            <p className={styles.etiquetaCambio}>Entrega de cambio</p>
            <p className={styles.montoCambio}>{formatearMoneda(cambio)}</p>
          </div>
        )}

        <div className={styles.paso}>
          <span className={styles.iconoPaso} aria-hidden="true">
            <Printer size={18} />
          </span>
          <div className={styles.pasoTexto}>
            <p className={styles.pasoTitulo}>Imprime el ticket de cocina</p>
            <p className={styles.pasoDescripcion}>Pégalo en la orden para que cocina la prepare.</p>
          </div>
          <button type="button" className={styles.botonPrimario} onClick={imprimirTicket}>
            <Printer size={18} aria-hidden="true" />
            Imprimir
          </button>
        </div>

        <div className={styles.acciones}>
          <Link to="/cajero/pedidos" className={styles.botonSecundario}>
            <Clock size={18} aria-hidden="true" />
            Ver pedidos de hoy
          </Link>
          <button type="button" className={styles.botonPrimario} onClick={onNuevo} autoFocus>
            <Plus size={18} aria-hidden="true" />
            Nuevo pedido
          </button>
        </div>
      </div>

      <TicketCocina pedido={pedido} descripciones={descripciones} />
    </section>
  )
}

export default PedidoRegistrado
