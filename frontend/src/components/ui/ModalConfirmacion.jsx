import Modal from './Modal'
import BotonPrimario from './BotonPrimario'
import styles from './Modal.module.css'


function ModalConfirmacion({ abierto, titulo, mensaje, cargando, onConfirmar, onCancelar }) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCancelar}>
      <p className={styles.mensaje}>{mensaje}</p>
      <div className={styles.acciones}>
        <button type="button" className={styles.botonSecundario} onClick={onCancelar}>
          Cancelar
        </button>
        <BotonPrimario type="button" onClick={onConfirmar} cargando={cargando}>
          Confirmar
        </BotonPrimario>
      </div>
    </Modal>
  )
}

export default ModalConfirmacion