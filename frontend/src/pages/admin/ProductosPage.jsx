import { useEffect, useState } from 'react'
import {
  listarProductosGestion,
  listarCategorias,
  cambiarDisponible,
  eliminarProducto,
} from '../../api/productosApi'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'
import styles from './ProductosPage.module.css'

function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtros, setFiltros] = useState({ nombre: '', idCategoria: '', disponible: '' })
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // Categorías para el filtro (solo una vez)
  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {})
  }, [])

  // Cada vez que cambian filtros o página, se pide al servidor SOLO esa página
  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const data = await listarProductosGestion({
          nombre: filtros.nombre || undefined,
          idCategoria: filtros.idCategoria || undefined,
          disponible: filtros.disponible || undefined,
          page: pagina,
          size: 10,
        })
        setProductos(data.content)
        setTotalPaginas(data.page.totalPages)
      } catch (e) {
        setError(e.mensajeUsuario)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [filtros, pagina, recargar])

  function cambiarFiltro(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
    setPagina(0) // al filtrar se vuelve a la primera página
  }

  async function alternarDisponible(producto) {
    try {
      await cambiarDisponible(producto.idProducto, !producto.disponible)
      setRecargar(recargar + 1)
    } catch (e) {
      setError(e.mensajeUsuario)
    }
  }

  async function confirmarEliminar() {
    setEliminando(true)
    try {
      await eliminarProducto(aEliminar.idProducto)
      setRecargar(recargar + 1)
    } catch (e) {
      setError(e.mensajeUsuario) // ej. 422: "ya está en pedidos; desactívalo en su lugar"
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  return (
    <section>
      <h1 className={styles.titulo}>Productos</h1>

      <div className={styles.filtros}>
        <input
          name="nombre"
          className={styles.control}
          placeholder="Buscar por nombre"
          value={filtros.nombre}
          onChange={cambiarFiltro}
        />
        <select name="idCategoria" className={styles.control} value={filtros.idCategoria} onChange={cambiarFiltro}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
          ))}
        </select>
        <select name="disponible" className={styles.control} value={filtros.disponible} onChange={cambiarFiltro}>
          <option value="">Disponibles y no disponibles</option>
          <option value="true">Solo disponibles</option>
          <option value="false">Solo no disponibles</option>
        </select>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {cargando ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No se encontraron productos.</p>
      ) : (
        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.idProducto}>
                  <td>{p.nombre}</td>
                  <td>{p.nombreCategoria}</td>
                  <td>${Number(p.precio).toFixed(2)}</td>
                  <td>
                    <button
                      className={`${styles.boton} ${p.disponible ? styles.disponible : ''}`}
                      onClick={() => alternarDisponible(p)}
                    >
                      {p.disponible ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td>
                    <button className={`${styles.boton} ${styles.eliminar}`} onClick={() => setAEliminar(p)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.paginacion}>
        <button className={styles.boton} disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>
          Anterior
        </button>
        <span>Página {pagina + 1} de {Math.max(totalPaginas, 1)}</span>
        <button
          className={styles.boton}
          disabled={pagina + 1 >= totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          Siguiente
        </button>
      </div>

      <ModalConfirmacion
        abierto={aEliminar !== null}
        titulo="Eliminar producto"
        mensaje={`¿Seguro que quieres eliminar "${aEliminar?.nombre}"?`}
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  )
}

export default ProductosPage