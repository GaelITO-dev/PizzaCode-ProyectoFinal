import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, ShoppingCart, Store, Trash2 } from 'lucide-react'
import { useCarrito } from '../../carrito/useCarrito'
import Contador from '../../components/ui/Contador'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'
import { formatearMoneda } from '../../utils/moneda'
import ImagenProducto from './ImagenProducto'
import styles from './CarritoPage.module.css'

function CarritoPage() {
  const navigate = useNavigate()
  const { items, cambiarCantidad, quitar, vaciar, totalPiezas, subtotal, maximo } = useCarrito()
  const [confirmarVaciar, setConfirmarVaciar] = useState(false)

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Tu carrito</h1>
          <p className={styles.subtitulo}>Revisa tus productos antes de pagar.</p>
        </div>
        <Link to="/cliente" className={styles.enlace}>
          <ArrowLeft size={16} aria-hidden="true" /> Seguir agregando productos
        </Link>
      </header>

      {items.length === 0 ? (
        <div className={`${styles.tarjeta} ${styles.vacio}`}>
          <ShoppingCart size={40} aria-hidden="true" />
          <p>Tu carrito está vacío.</p>
          <Link to="/cliente" className={styles.botonPrincipal}>Ver el menú</Link>
        </div>
      ) : (
        <div className={styles.columnas}>
          <div className={styles.tarjeta}>
            <div className={styles.tarjetaEncabezado}>
              <h2 className={styles.tarjetaTitulo}>Productos ({items.length})</h2>
              <button type="button" className={styles.botonTexto} onClick={() => setConfirmarVaciar(true)}>
                Vaciar carrito
              </button>
            </div>

            <ul className={styles.lista}>
              {items.map((i) => (
                <li key={i.idProducto} className={styles.renglon}>
                  <ImagenProducto imagen={i.imagen} className={styles.imagen} tamanoIcono={22} />
                  <div className={styles.datos}>
                    <p className={styles.nombre}>{i.nombre}</p>
                    <p className={styles.precioUnitario}>{formatearMoneda(i.precio)} c/u</p>
                  </div>
                  <Contador
                    valor={i.cantidad}
                    maximo={maximo}
                    etiqueta={`Cantidad de ${i.nombre}`}
                    onCambiar={(n) => cambiarCantidad(i.idProducto, n)}
                  />
                  <p className={styles.importe}>{formatearMoneda(i.precio * i.cantidad)}</p>
                  <button
                    type="button"
                    className={styles.botonQuitar}
                    aria-label={`Quitar ${i.nombre}`}
                    onClick={() => quitar(i.idProducto)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <aside className={styles.tarjeta}>
            <h2 className={styles.tarjetaTitulo}>Resumen del pedido</h2>
            <div className={styles.fila}>
              <span>Subtotal ({totalPiezas} productos)</span>
              <span>{formatearMoneda(subtotal)}</span>
            </div>
            <div className={`${styles.fila} ${styles.filaTotal}`}>
              <span>Total</span>
              <span>{formatearMoneda(subtotal)}</span>
            </div>
            <p className={styles.nota}>Precios con IVA incluido.</p>
            <button type="button" className={styles.botonPrincipal} onClick={() => navigate('/cliente/pago')}>
              <CreditCard size={18} aria-hidden="true" /> Continuar al pago
            </button>
            <p className={styles.sucursal}>
              <Store size={16} aria-hidden="true" /> Recoges en Pizza Code – Sucursal Centro
            </p>
          </aside>
        </div>
      )}

      <ModalConfirmacion
        abierto={confirmarVaciar}
        titulo="Vaciar carrito"
        mensaje="¿Seguro que quieres quitar todos los productos de tu carrito?"
        onConfirmar={() => {
          vaciar()
          setConfirmarVaciar(false)
        }}
        onCancelar={() => setConfirmarVaciar(false)}
      />
    </section>
  )
}

export default CarritoPage
