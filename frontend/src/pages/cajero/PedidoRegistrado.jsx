import { Link } from 'react-router-dom'
import { Check, Clock, Plus } from 'lucide-react'
import { formatearMoneda } from '../../utils/moneda'
import styles from './PedidoRegistrado.module.css'

const NOMBRE_METODO = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta' }

function PedidoRegistrado({ pedido, cambio, onNuevo }) {
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
    </section>
  )
}

export default PedidoRegistrado
