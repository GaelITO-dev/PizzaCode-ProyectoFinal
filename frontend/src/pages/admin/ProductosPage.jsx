import { useEffect, useState } from 'react'
import { Pencil, Pizza, Plus, Search, Trash2 } from 'lucide-react'
import {
  listarProductosGestion,
  contarProductos,
  listarCategorias,
  cambiarDisponible,
  eliminarProducto,
} from '../../api/productosApi'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'
import Interruptor from '../../components/ui/Interruptor'
import ProductoFormulario from './ProductoFormulario'
import styles from './ProductosPage.module.css'

const TAMANO_PAGINA = 10

function Dato({ etiqueta, valor }) {
  return (
    <div className={styles.dato}>
      <p className={styles.datoEtiqueta}>{etiqueta}</p>
      <p className={styles.datoValor}>{valor}</p>
    </div>
  )
}

function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [resumen, setResumen] = useState({ total: 0, disponibles: 0, noDisponibles: 0 })
  const [filtros, setFiltros] = useState({ nombre: '', idCategoria: '', disponible: '' })
  const [pagina, setPagina] = useState(0)
  const [infoPagina, setInfoPagina] = useState({ totalPages: 0, totalElements: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)
  const [formulario, setFormulario] = useState(null) // null = cerrado; { producto } = abierto
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // Categorías para los chips y el formulario
  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {})
  }, [])

  // Tarjetas de resumen: el servidor hace el conteo
  useEffect(() => {
    Promise.all([
      contarProductos({}),
      contarProductos({ disponible: true }),
      contarProductos({ disponible: false }),
    ])
      .then(([total, disponibles, noDisponibles]) => setResumen({ total, disponibles, noDisponibles }))
      .catch(() => {})
  }, [recargar])

  // Tabla: cada cambio de filtro o página pide SOLO esa página al servidor
  useEffect(() => {
    let vigente = true // evita pintar una respuesta vieja si el usuario sigue escribiendo
    listarProductosGestion({
      nombre: filtros.nombre || undefined,
      idCategoria: filtros.idCategoria || undefined,
      disponible: filtros.disponible || undefined,
      page: pagina,
      size: TAMANO_PAGINA,
    })
      .then((data) => {
        if (!vigente) return
        setProductos(data.content)
        setInfoPagina(data.page)
        setError('')
      })
      .catch((e) => vigente && setError(e.mensajeUsuario))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [filtros, pagina, recargar])

  function refrescar() {
    setCargando(true)
    setRecargar((n) => n + 1)
  }

  function cambiarFiltro(nombre, valor) {
    setCargando(true)
    setFiltros({ ...filtros, [nombre]: valor })
    setPagina(0) // al filtrar se vuelve a la primera página
  }

  function cambiarPagina(nueva) {
    setCargando(true)
    setPagina(nueva)
  }

  async function alternarDisponible(producto, valor) {
    try {
      await cambiarDisponible(producto.idProducto, valor)
      refrescar()
    } catch (e) {
      setError(e.mensajeUsuario)
    }
  }

  async function confirmarEliminar() {
    setEliminando(true)
    try {
      await eliminarProducto(aEliminar.idProducto)
      refrescar()
    } catch (e) {
      setError(e.mensajeUsuario) // ej. 422: "ya está en pedidos; desactívalo en su lugar"
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  const desde = infoPagina.totalElements === 0 ? 0 : pagina * TAMANO_PAGINA + 1
  const hasta = Math.min((pagina + 1) * TAMANO_PAGINA, infoPagina.totalElements)
  const claseChip = (activo) => (activo ? `${styles.chip} ${styles.chipActivo}` : styles.chip)

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Productos</h1>
          <p className={styles.subtitulo}>Crea, edita y activa o desactiva la disponibilidad de cada producto.</p>
        </div>
        <button type="button" className={styles.botonNuevo} onClick={() => setFormulario({ producto: null })}>
          <Plus size={18} aria-hidden="true" />
          Nuevo producto
        </button>
      </header>

      <div className={styles.resumen}>
        <Dato etiqueta="Productos" valor={resumen.total} />
        <Dato etiqueta="Disponibles" valor={resumen.disponibles} />
        <Dato etiqueta="No disponibles" valor={resumen.noDisponibles} />
        <Dato etiqueta="Categorías" valor={categorias.length} />
      </div>

      <div className={styles.tarjeta}>
        <div className={styles.barraFiltros}>
          <label className={styles.buscador}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nombre"
              aria-label="Buscar producto por nombre"
              value={filtros.nombre}
              onChange={(e) => cambiarFiltro('nombre', e.target.value)}
            />
          </label>
          <select
            className={styles.selector}
            aria-label="Filtrar por disponibilidad"
            value={filtros.disponible}
            onChange={(e) => cambiarFiltro('disponible', e.target.value)}
          >
            <option value="">Disponibilidad: Todas</option>
            <option value="true">Disponibilidad: Disponibles</option>
            <option value="false">Disponibilidad: No disponibles</option>
          </select>
        </div>

        <div className={styles.chips}>
          <button
            type="button"
            className={claseChip(filtros.idCategoria === '')}
            onClick={() => cambiarFiltro('idCategoria', '')}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c.idCategoria}
              type="button"
              className={claseChip(filtros.idCategoria === String(c.idCategoria))}
              onClick={() => cambiarFiltro('idCategoria', String(c.idCategoria))}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th className={styles.derecha}>Precio</th>
                <th>Disponible</th>
                <th className={styles.derecha}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} className={styles.estado}>Cargando productos...</td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.estado}>No se encontraron productos.</td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.idProducto}>
                    <td>
                      <div className={styles.producto}>
                        {p.imagen ? (
                          <img src={p.imagen} alt="" className={styles.miniatura} />
                        ) : (
                          <span className={styles.miniatura} aria-hidden="true">
                            <Pizza size={18} />
                          </span>
                        )}
                        <div>
                          <p className={styles.nombre}>{p.nombre}</p>
                          {p.descripcion && <p className={styles.descripcion}>{p.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.categoria}>{p.nombreCategoria}</span>
                    </td>
                    <td className={styles.precio}>${Number(p.precio).toFixed(2)}</td>
                    <td>
                      <Interruptor
                        activo={p.disponible}
                        etiqueta={p.disponible ? 'Disponible' : 'No disponible'}
                        onCambiar={(valor) => alternarDisponible(p, valor)}
                      />
                    </td>
                    <td>
                      <div className={styles.acciones}>
                        <button
                          type="button"
                          className={styles.botonEditar}
                          onClick={() => setFormulario({ producto: p })}
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          className={styles.botonEliminar}
                          aria-label={`Eliminar ${p.nombre}`}
                          onClick={() => setAEliminar(p)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.paginacion}>
          <span>
            Mostrando {desde}–{hasta} de {infoPagina.totalElements}
          </span>
          <div className={styles.botonesPagina}>
            <button
              type="button"
              className={styles.botonPagina}
              disabled={pagina === 0}
              onClick={() => cambiarPagina(pagina - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              className={styles.botonPagina}
              disabled={pagina + 1 >= infoPagina.totalPages}
              onClick={() => cambiarPagina(pagina + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {formulario && (
        <ProductoFormulario
          producto={formulario.producto}
          categorias={categorias}
          onCerrar={() => setFormulario(null)}
          onGuardado={() => {
            setFormulario(null)
            refrescar()
          }}
        />
      )}

      <ModalConfirmacion
        abierto={aEliminar !== null}
        titulo="Eliminar producto"
        mensaje={`¿Seguro que quieres eliminar "${aEliminar?.nombre}"? Si ya está en pedidos, mejor desactívalo.`}
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  )
}

export default ProductosPage
