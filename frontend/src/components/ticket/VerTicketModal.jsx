import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Printer } from 'lucide-react'
import { obtenerMiPedido } from '../../api/pedidosClienteApi'
import Modal from '../ui/Modal'
import { imprimirTicket } from '../../utils/impresion'
import TicketCliente from './TicketCliente'
import styles from './VerTicketModal.module.css'

// Modal "Ver ticket": trae el pedido del cliente y muestra su ticket digital.
// Se monta solo cuando hay un idPedido (el padre lo renderiza con {id && <VerTicketModal ... />})
function VerTicketModal({ idPedido, onCerrar }) {
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    obtenerMiPedido(idPedido)
      .then((data) => vigente && setPedido(data))
      .catch((e) => vigente && setError(e.mensajeUsuario))
    return () => {
      vigente = false
    }
  }, [idPedido])

  return (
    <Modal abierto titulo={`Ticket del pedido #${idPedido}`} onCerrar={onCerrar}>
      {error ? (
        <p className={styles.error} role="alert">{error}</p>
      ) : !pedido ? (
        <p className={styles.estado}>Cargando ticket...</p>
      ) : (
        <>
          <TicketCliente pedido={pedido} />
          <button type="button" className={styles.imprimir} onClick={imprimirTicket}>
            <Printer size={16} aria-hidden="true" /> Imprimir
          </button>
          {/* Copia fuera de #root: al imprimir se oculta la app y solo sale el ticket */}
          {createPortal(
            <div className={styles.impresion}>
              <TicketCliente pedido={pedido} />
            </div>,
            document.body,
          )}
        </>
      )}
    </Modal>
  )
}

export default VerTicketModal
