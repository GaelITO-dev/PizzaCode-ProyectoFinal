import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Check, Percent, Search, ShoppingBag, Tag } from 'lucide-react'
import { obtenerPromocion, crearPromocion, actualizarPromocion } from '../../api/promocionesApi'
import { listarProductosGestion } from '../../api/productosApi'
import CampoTexto from '../../components/ui/CampoTexto'
import BotonPrimario from '../../components/ui/BotonPrimario'
import campo from '../../components/ui/CampoTexto.module.css'
import imagenPizza from '../../assets/pizza-auth.png'
import { rangoFechas } from '../../utils/fechas'
import base from './ProductosPage.module.css'
import Cargando from '../../components/ui/Cargando'
import styles from './PromocionFormularioPage.module.css'

// Mismas reglas que PromocionRequestDTO (más la de fechas, que en el backend da 422)
function validar(datos) {
  const errores = {}
  const nombre = datos.nombre.trim()
  if (!nombre) errores.nombre = 'El nombre es obligatorio'
  else if (nombre.length > 100) errores.nombre = 'El nombre no debe superar los 100 caracteres'

  const descuento = Number(datos.descuento)
  if (datos.descuento === '') errores.descuento = 'El descuento es obligatorio'
  else if (Number.isNaN(descuento) || descuento < 0.01) errores.descuento = 'El descuento debe ser mayor a 0'
  else if (descuento > 100) errores.descuento = 'El descuento no puede ser mayor a 100'

  if (!datos.fechaInicio) errores.fechaInicio = 'La fecha de inicio es obligatoria'
  if (!datos.fechaFin) errores.fechaFin = 'La fecha de fin es obligatoria'
  else if (datos.fechaInicio && datos.fechaFin < datos.fechaInicio) {
    errores.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio'
  }

  if (datos.idsProductos.length === 0) errores.idsProductos = 'Selecciona al menos un producto'
  return errores
}

const dinero = (n) => `$${n.toFixed(2)}`

function PromocionFormularioPage() {
  const { id } = useParams() // si hay id es edición
  const navegar = useNavigate()

  const [datos, setDatos] = useState({ nombre: '', descuento: '', fechaInicio: '', fechaFin: '', idsProductos: [] })
  const [cargandoPromocion, setCargandoPromocion] = useState(Boolean(id))
  const [productos, setProductos] = useState([])
  const [totalProductos, setTotalProductos] = useState(0)
  const [conocidos, setConocidos] = useState({}) // productos ya vistos, por id (para la vista previa)
  const [busqueda, setBusqueda] = useState('')
  const [tocados, setTocados] = useState({})
  const [erroresServidor, setErroresServidor] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  // En edición, carga la promoción
  useEffect(() => {
    if (!id) return
    obtenerPromocion(id)
      .then((p) =>
        setDatos({
          nombre: p.nombre,
          descuento: String(Number(p.descuento)),
          fechaInicio: p.fechaInicio,
          fechaFin: p.fechaFin,
          idsProductos: p.idsProductos,
        })
      )
      .catch((e) => setErrorGeneral(e.mensajeUsuario))
      .finally(() => setCargandoPromocion(false))
  }, [id])

  // Productos para elegir: la búsqueda se hace en el servidor
  useEffect(() => {
    let vigente = true
    listarProductosGestion({ nombre: busqueda || undefined, size: 50, sort: 'nombre' })
      .then((data) => {
        if (!vigente) return
        setProductos(data.content)
        if (!busqueda) setTotalProductos(data.page.totalElements)
        setConocidos((antes) => {
          const nuevos = { ...antes }
          data.content.forEach((p) => {
            nuevos[p.idProducto] = p
          })
          return nuevos
        })
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [busqueda])

  const errores = validar(datos)
  const errorDe = (c) => (tocados[c] && errores[c]) || erroresServidor[c]

  function cambiar(nombreCampo, valor) {
    setDatos({ ...datos, [nombreCampo]: valor })
    setTocados({ ...tocados, [nombreCampo]: true })
    setErroresServidor({ ...erroresServidor, [nombreCampo]: undefined })
  }

  function alternarProducto(idProducto) {
    const ids = datos.idsProductos.includes(idProducto)
      ? datos.idsProductos.filter((x) => x !== idProducto)
      : [...datos.idsProductos, idProducto]
    cambiar('idsProductos', ids)
  }

  async function guardar(e) {
    e.preventDefault()
    setTocados({ nombre: true, descuento: true, fechaInicio: true, fechaFin: true, idsProductos: true })
    if (Object.keys(errores).length > 0) return

    const cuerpo = { ...datos, nombre: datos.nombre.trim(), descuento: Number(datos.descuento) }
    setGuardando(true)
    setErrorGeneral('')
    try {
      if (id) await actualizarPromocion(id, cuerpo)
      else await crearPromocion(cuerpo)
      navegar('/admin/promociones')
    } catch (err) {
      setErroresServidor(err.response?.data?.errors ?? {})
      setErrorGeneral(err.mensajeUsuario) // ej. 422 de fechas
      setGuardando(false)
    }
  }

  // Vista previa: usa el primer producto seleccionado como ejemplo de precio
  const ejemplo = conocidos[datos.idsProductos[0]]
  const precioNormal = ejemplo ? Number(ejemplo.precio) : 0
  const precioConDescuento = precioNormal * (1 - (Number(datos.descuento) || 0) / 100)
  const nombresSeleccionados = datos.idsProductos.map((x) => conocidos[x]?.nombre).filter(Boolean)

  return (
    <section className={base.pagina}>
      <button type="button" className={styles.volver} onClick={() => navegar('/admin/promociones')}>
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a promociones
      </button>

      <header>
        <h1 className={base.titulo}>{id ? 'Editar promoción' : 'Nueva promoción'}</h1>
        <p className={base.subtitulo}>Los clientes la verán en la sección de Promociones.</p>
      </header>

      {cargandoPromocion ? (
        <p className={styles.mensaje}><Cargando texto="Cargando promoción..." /></p>
      ) : (
        <form className={styles.contenido} onSubmit={guardar} noValidate>
          <div className={styles.columna}>
            {errorGeneral && <p className={styles.errorGeneral} role="alert">{errorGeneral}</p>}

            <div className={styles.seccion}>
              <h2 className={styles.tituloSeccion}>Datos de la promoción</h2>
              <div className={styles.cuadricula}>
                <CampoTexto
                  etiqueta="Nombre"
                  icono={Tag}
                  placeholder="Ej. Martes 2x1 en grandes"
                  value={datos.nombre}
                  onChange={(e) => cambiar('nombre', e.target.value)}
                  error={errorDe('nombre')}
                />
                <CampoTexto
                  etiqueta="Descuento (%)"
                  icono={Percent}
                  tipo="number"
                  min="1"
                  max="100"
                  placeholder="50"
                  value={datos.descuento}
                  onChange={(e) => cambiar('descuento', e.target.value)}
                  error={errorDe('descuento')}
                />
                <CampoTexto
                  etiqueta="Fecha de inicio"
                  icono={Calendar}
                  tipo="date"
                  value={datos.fechaInicio}
                  onChange={(e) => cambiar('fechaInicio', e.target.value)}
                  error={errorDe('fechaInicio')}
                />
                <CampoTexto
                  etiqueta="Fecha de fin"
                  icono={Calendar}
                  tipo="date"
                  value={datos.fechaFin}
                  onChange={(e) => cambiar('fechaFin', e.target.value)}
                  error={errorDe('fechaFin')}
                />
              </div>
            </div>

            <div className={styles.seccion}>
              <h2 className={styles.tituloSeccion}>Productos incluidos</h2>
              <div className={styles.barraProductos}>
                <span className={styles.contador}>
                  {datos.idsProductos.length} de {totalProductos} seleccionados
                </span>
                <label className={`${base.buscador} ${styles.buscadorProductos}`}>
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Buscar producto"
                    aria-label="Buscar producto"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </label>
              </div>

              {productos.length === 0 ? (
                <p className={styles.mensaje}>No se encontraron productos.</p>
              ) : (
                <div className={styles.listaProductos}>
                  {productos.map((p) => {
                    const marcado = datos.idsProductos.includes(p.idProducto)
                    return (
                      <label
                        key={p.idProducto}
                        className={marcado ? `${styles.opcion} ${styles.opcionMarcada}` : styles.opcion}
                      >
                        <input type="checkbox" checked={marcado} onChange={() => alternarProducto(p.idProducto)} />
                        <span>
                          <p className={styles.opcionNombre}>{p.nombre}</p>
                          <p className={styles.opcionDetalle}>
                            {p.nombreCategoria} · {dinero(Number(p.precio))}
                          </p>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
              {errorDe('idsProductos') && <p className={campo.error}>{errorDe('idsProductos')}</p>}
            </div>
          </div>

          <aside>
            <p className={styles.etiquetaVista}>Así la verá el cliente</p>
            <div className={styles.vista}>
              <img src={imagenPizza} alt="" className={styles.vistaImagen} />
              <div className={styles.vistaCuerpo}>
                <span className={styles.vistaDescuento}>{Number(datos.descuento) || 0}%</span>
                <h3 className={styles.vistaNombre}>{datos.nombre.trim() || 'Nombre de la promoción'}</h3>
                <p className={styles.vistaTexto}>
                  {nombresSeleccionados.length > 0 ? nombresSeleccionados.join(', ') : 'Elige los productos'}
                </p>
                {datos.fechaInicio && datos.fechaFin && datos.fechaFin >= datos.fechaInicio && (
                  <p className={styles.vistaTexto}>
                    <Calendar size={14} aria-hidden="true" />
                    {rangoFechas(datos.fechaInicio, datos.fechaFin)}
                  </p>
                )}
                {ejemplo && (
                  <div className={styles.precios}>
                    <span className={styles.precioAntes}>{dinero(precioNormal)}</span>
                    <span className={styles.precioAhora}>{dinero(precioConDescuento)}</span>
                  </div>
                )}
                <span className={styles.vistaBoton} aria-hidden="true">
                  <ShoppingBag size={16} />
                  Agregar al carrito
                </span>
              </div>
            </div>

            <div className={styles.botones}>
              <button type="button" className={styles.botonCancelar} onClick={() => navegar('/admin/promociones')}>
                Cancelar
              </button>
              <BotonPrimario cargando={guardando} textoCargando="Guardando...">
                <Check size={18} aria-hidden="true" />
                Guardar
              </BotonPrimario>
            </div>
          </aside>
        </form>
      )}
    </section>
  )
}

export default PromocionFormularioPage
