import { useEffect, useState } from 'react'
import { Calendar, Check, Tag } from 'lucide-react'
import { listarPromociones } from '../../api/promocionesApi'
import { useCarrito } from '../../carrito/useCarrito'
import { precioConDescuento, useDescuentos } from '../../carrito/useDescuentos'
import Paginacion from '../../components/ui/Paginacion'
import { fechaCorta } from '../../utils/fechas'
import { formatearMoneda } from '../../utils/moneda'
import Cargando from '../../components/ui/Cargando'
import styles from './PromocionesClientePage.module.css'

const TAMANO_PAGINA = 6
const PRODUCTOS_VISIBLES = 4

function TarjetaPromocion({ promo, descuentoDe, onAgregar, agregados }) {
  const [verTodos, setVerTodos] = useState(false)
  const porcentaje = Number(promo.descuento)

  // Solo los productos donde ESTA promoción es la que se cobra (si otra da más, sale en esa otra tarjeta)
  const aplicables = promo.productos.filter((p) => descuentoDe(p.idProducto) <= porcentaje)
  const productos = verTodos ? aplicables : aplicables.slice(0, PRODUCTOS_VISIBLES)
  const ocultos = aplicables.length - PRODUCTOS_VISIBLES

  return (
    <article className={styles.tarjeta}>
      <div className={styles.cabecera}>
        <p className={styles.porcentaje}>
          {porcentaje}%<span>de descuento</span>
        </p>
        <Tag size={28} aria-hidden="true" />
      </div>

      <div className={styles.cuerpo}>
        <h2 className={styles.nombre}>{promo.nombre}</h2>
        <p className={styles.vigencia}>
          <Calendar size={14} aria-hidden="true" /> Válida hasta el {fechaCorta(promo.fechaFin)} {promo.fechaFin.slice(0, 4)}
        </p>

        {aplicables.length === 0 ? (
          <p className={styles.vacio}>Esta promoción aún no tiene productos.</p>
        ) : (
          <>
            <p className={styles.aplica}>
              Aplica en {aplicables.length} {aplicables.length === 1 ? 'producto' : 'productos'}:
            </p>
            <ul className={styles.productos}>
              {productos.map((p) => (
                <li key={p.idProducto} className={styles.producto}>
                  <span className={styles.productoNombre}>{p.nombre}</span>
                  <span className={styles.precios}>
                    <s>{formatearMoneda(p.precio)}</s>
                    <strong>{formatearMoneda(precioConDescuento(p.precio, porcentaje))}</strong>
                  </span>
                  <button
                    type="button"
                    className={styles.agregar}
                    disabled={!p.disponible}
                    aria-label={`Agregar ${p.nombre} al carrito`}
                    onClick={() => onAgregar(p)}
                  >
                    {!p.disponible ? 'Agotado' : agregados.includes(p.idProducto) ? (
                      <>
                        <Check size={14} aria-hidden="true" /> Agregado
                      </>
                    ) : (
                      'Agregar'
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {ocultos > 0 && (
          <button type="button" className={styles.verMas} onClick={() => setVerTodos(!verTodos)}>
            {verTodos ? 'Ver menos' : `Ver ${ocultos} ${ocultos === 1 ? 'producto' : 'productos'} más`}
          </button>
        )}
      </div>
    </article>
  )
}

function PromocionesClientePage() {
  const { agregar } = useCarrito()
  const { descuentoDe } = useDescuentos()
  const [promociones, setPromociones] = useState([])
  const [pagina, setPagina] = useState(0)
  const [infoPagina, setInfoPagina] = useState({ totalPages: 0, totalElements: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [agregados, setAgregados] = useState([])

  // Solo las vigentes hoy, paginadas por el servidor
  useEffect(() => {
    let vigente = true
    listarPromociones({ vigentes: true, page: pagina, size: TAMANO_PAGINA, sort: 'fechaFin' })
      .then((data) => {
        if (!vigente) return
        setPromociones(data.content)
        setInfoPagina(data.page)
        setError('')
      })
      .catch((e) => vigente && setError(e.mensajeUsuario))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [pagina])

  function cambiarPagina(nueva) {
    setCargando(true)
    setPagina(nueva)
  }

  function agregarProducto(producto) {
    agregar(producto, 1)
    setAgregados([...agregados, producto.idProducto])
  }

  return (
    <section className={styles.pagina}>
      <header>
        <h1 className={styles.titulo}>Promociones</h1>
        <p className={styles.subtitulo}>Descuentos vigentes en productos seleccionados. El descuento se aplica solo en tu carrito.</p>
      </header>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {cargando ? (
        <p className={styles.estado}><Cargando texto="Cargando promociones..." /></p>
      ) : promociones.length === 0 ? (
        <p className={styles.estado}>No hay promociones vigentes por ahora.</p>
      ) : (
        <div className={styles.cuadricula}>
          {promociones.map((p) => (
            <TarjetaPromocion key={p.idPromocion} promo={p} descuentoDe={descuentoDe} onAgregar={agregarProducto} agregados={agregados} />
          ))}
        </div>
      )}

      {infoPagina.totalPages > 1 && (
        <Paginacion
          pagina={pagina}
          totalPaginas={infoPagina.totalPages}
          totalElementos={infoPagina.totalElements}
          tamano={TAMANO_PAGINA}
          onCambiar={cambiarPagina}
        />
      )}
    </section>
  )
}

export default PromocionesClientePage
