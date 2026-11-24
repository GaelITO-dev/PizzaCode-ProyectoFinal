import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Plus, ShoppingBag } from 'lucide-react'
import { listarMenu, obtenerProducto } from '../../api/productosApi'
import { useCarrito } from '../../carrito/useCarrito'
import { useDescuentos } from '../../carrito/useDescuentos'
import Contador from '../../components/ui/Contador'
import { formatearMoneda } from '../../utils/moneda'
import { agruparProductos, etiquetaTamano, nombreBase, ordenarPorTamano, tamanoDe } from '../../utils/productos'
import ImagenProducto from './ImagenProducto'
import Cargando from '../../components/ui/Cargando'
import styles from './ProductoDetallePage.module.css'

// Trae el producto y, si tiene tamaño (pizzas), sus otros tamaños del mismo nombre y categoría
async function cargarProductoConTamanos(id) {
  const producto = await obtenerProducto(id)
  if (!tamanoDe(producto.nombre)) return { producto, tamanos: [producto] }

  const base = nombreBase(producto.nombre)
  const data = await listarMenu({ nombre: base, idCategoria: producto.idCategoria, todos: true, size: 20 })
  const tamanos = data.content.filter((p) => nombreBase(p.nombre) === base && tamanoDe(p.nombre))
  return { producto, tamanos: ordenarPorTamano(tamanos) }
}

function Recomendado({ grupo, onAbrir, onAgregar, agregado, precioDe }) {
  const producto = grupo.productos[0]
  return (
    <div className={styles.recomendado}>
      <button type="button" className={styles.recomendadoInfo} onClick={onAbrir}>
        <ImagenProducto imagen={grupo.imagen} className={styles.recomendadoImagen} tamanoIcono={20} />
        <span>
          <span className={styles.recomendadoNombre}>{grupo.nombre}</span>
          {etiquetaTamano(producto.nombre) && (
            <span className={styles.recomendadoTamano}>{etiquetaTamano(producto.nombre)}</span>
          )}
          <span className={styles.recomendadoPrecio}>{formatearMoneda(precioDe(producto))}</span>
        </span>
      </button>
      <button
        type="button"
        className={styles.botonMas}
        aria-label={`Agregar ${producto.nombre} al carrito`}
        onClick={() => onAgregar(producto)}
      >
        {agregado ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
      </button>
    </div>
  )
}

// La key={id} hace que al cambiar de producto el componente empiece de cero (cantidad 1, etc.)
function ProductoDetallePage() {
  const { id } = useParams()
  return <ProductoDetalle key={id} id={id} />
}

function ProductoDetalle({ id }) {
  const navigate = useNavigate()
  const { agregar } = useCarrito()
  const { descuentoDe, precioDe } = useDescuentos()
  const [tamanos, setTamanos] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [recomendados, setRecomendados] = useState([])
  const [cantidad, setCantidad] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [agregado, setAgregado] = useState(false)
  const [recomendadoAgregado, setRecomendadoAgregado] = useState(null)

  useEffect(() => {
    let vigente = true
    cargarProductoConTamanos(id)
      .then(({ producto, tamanos }) => {
        if (!vigente) return
        setTamanos(tamanos)
        setSeleccionado(producto)
      })
      .catch((e) => vigente && setError(e.mensajeUsuario))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [id])

  // "También te puede gustar": otros productos disponibles del menú (no se recarga al cambiar de tamaño)
  const base = seleccionado ? nombreBase(seleccionado.nombre) : null
  useEffect(() => {
    if (!base) return
    let vigente = true
    listarMenu({ size: 12 })
      .then((data) => {
        if (!vigente) return
        setRecomendados(agruparProductos(data.content).filter((g) => g.nombre !== base).slice(0, 4))
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [base])

  function elegirTamano(producto) {
    setSeleccionado(producto)
    setAgregado(false)
  }

  function agregarAlCarrito() {
    agregar(seleccionado, cantidad)
    setAgregado(true)
  }

  function agregarRecomendado(producto) {
    agregar(producto, 1)
    setRecomendadoAgregado(producto.idProducto)
  }

  if (cargando) return <p className={styles.estado}><Cargando texto="Cargando producto..." /></p>
  if (error || !seleccionado) {
    return (
      <div className={styles.estado}>
        <p className={styles.error} role="alert">{error || 'No se encontró el producto.'}</p>
        <Link to="/cliente" className={styles.volver}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver al menú
        </Link>
      </div>
    )
  }

  const tieneTamanos = tamanos.length > 1 || tamanoDe(seleccionado.nombre)

  return (
    <section className={styles.pagina}>
      <Link to="/cliente" className={styles.volver}>
        <ArrowLeft size={16} aria-hidden="true" /> Volver al menú
      </Link>

      <article className={styles.tarjeta}>
        <ImagenProducto imagen={seleccionado.imagen} className={styles.imagen} tamanoIcono={96} />

        <div className={styles.info}>
          <div className={styles.etiquetas}>
            <span className={seleccionado.disponible ? styles.disponible : styles.agotado}>
              {seleccionado.disponible ? 'Disponible' : 'Agotado'}
            </span>
            <span className={styles.categoria}>{seleccionado.nombreCategoria}</span>
            {descuentoDe(seleccionado.idProducto) > 0 && (
              <span className={styles.promo}>-{descuentoDe(seleccionado.idProducto)}% de promoción</span>
            )}
          </div>

          <h1 className={styles.titulo}>{base}</h1>
          {seleccionado.descripcion && <p className={styles.descripcion}>{seleccionado.descripcion}</p>}

          {tieneTamanos && (
            <>
              <p className={styles.subtitulo}>Elige el tamaño</p>
              <div className={styles.tamanos}>
                {tamanos.map((p) => (
                  <button
                    key={p.idProducto}
                    type="button"
                    className={p.idProducto === seleccionado.idProducto ? `${styles.tamano} ${styles.tamanoActivo}` : styles.tamano}
                    aria-pressed={p.idProducto === seleccionado.idProducto}
                    disabled={!p.disponible}
                    onClick={() => elegirTamano(p)}
                  >
                    <span className={styles.tamanoNombre}>{etiquetaTamano(p.nombre)}</span>
                    <span className={styles.tamanoPrecio}>{p.disponible ? formatearMoneda(precioDe(p)) : 'Agotado'}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className={styles.cantidad}>
            <p className={styles.subtitulo}>Cantidad</p>
            <Contador valor={cantidad} onCambiar={setCantidad} />
          </div>

          <div className={styles.pie}>
            <div>
              <p className={styles.totalEtiqueta}>Total</p>
              <p className={styles.total}>{formatearMoneda(precioDe(seleccionado) * cantidad)}</p>
              {descuentoDe(seleccionado.idProducto) > 0 && (
                <p className={styles.antes}>Antes {formatearMoneda(seleccionado.precio * cantidad)}</p>
              )}
            </div>
            <button
              type="button"
              className={styles.botonAgregar}
              disabled={!seleccionado.disponible}
              onClick={agregarAlCarrito}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              {seleccionado.disponible ? 'Agregar al carrito' : 'No disponible'}
            </button>
          </div>

          {agregado && (
            <p className={styles.agregado} role="status">
              <Check size={16} aria-hidden="true" /> Agregado a tu carrito.{' '}
              <Link to="/cliente/carrito">Ver carrito</Link>
            </p>
          )}
        </div>
      </article>

      {recomendados.length > 0 && (
        <div>
          <h2 className={styles.seccionTitulo}>También te puede gustar</h2>
          <div className={styles.recomendados}>
            {recomendados.map((g) => (
              <Recomendado
                key={`${g.idCategoria}-${g.nombre}`}
                grupo={g}
                agregado={recomendadoAgregado === g.productos[0].idProducto}
                precioDe={precioDe}
                onAbrir={() => navigate(`/cliente/producto/${g.productos[0].idProducto}`)}
                onAgregar={agregarRecomendado}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default ProductoDetallePage
