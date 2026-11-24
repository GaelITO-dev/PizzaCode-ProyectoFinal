import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Pizza, Search } from 'lucide-react'
import { listarCategorias, listarMenu } from '../../api/productosApi'
import Paginacion from '../../components/ui/Paginacion'
import { agruparProductos } from '../../utils/productos'
import PropuestasPanel from './PropuestasPanel'
import SugerenciaFormulario from './SugerenciaFormulario'
import Cargando from '../../components/ui/Cargando'
import styles from './InicioClientePage.module.css'

const TAMANO_PAGINA = 24

function TarjetaProducto({ grupo, onAbrir }) {
  return (
    <button
      type="button"
      className={grupo.disponible ? styles.producto : `${styles.producto} ${styles.productoAgotado}`}
      onClick={onAbrir}
    >
      {grupo.imagen ? (
        <img src={grupo.imagen} alt="" className={styles.imagen} />
      ) : (
        <span className={styles.imagen} aria-hidden="true">
          <Pizza size={28} />
        </span>
      )}
      <span className={styles.nombre}>{grupo.nombre}</span>
      <span className={grupo.disponible ? styles.etiquetaDisponible : styles.etiquetaAgotado}>
        {grupo.disponible ? 'Disponible' : 'Agotado'}
      </span>
    </button>
  )
}

function InicioClientePage() {
  const navigate = useNavigate()
  const [grupos, setGrupos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtros, setFiltros] = useState({ nombre: '', idCategoria: '' })
  const [pagina, setPagina] = useState(0)
  const [infoPagina, setInfoPagina] = useState({ totalPages: 0, totalElements: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {})
  }, [])

  // El servidor filtra por nombre y categoría y regresa solo la página pedida.
  // todos=true para que también lleguen los agotados y se vean con su etiqueta.
  useEffect(() => {
    let vigente = true
    listarMenu({
      nombre: filtros.nombre || undefined,
      idCategoria: filtros.idCategoria || undefined,
      todos: true,
      page: pagina,
      size: TAMANO_PAGINA,
    })
      .then((data) => {
        if (!vigente) return
        setGrupos(agruparProductos(data.content))
        setInfoPagina(data.page)
        setError('')
      })
      .catch((e) => vigente && setError(e.mensajeUsuario))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [filtros, pagina])

  function cambiarFiltro(nombre, valor) {
    setCargando(true)
    setFiltros({ ...filtros, [nombre]: valor })
    setPagina(0)
  }

  function cambiarPagina(nueva) {
    setCargando(true)
    setPagina(nueva)
  }

  // Abre el detalle con el primer tamaño disponible del grupo
  function abrirDetalle(grupo) {
    const producto = grupo.productos.find((p) => p.disponible) ?? grupo.productos[0]
    navigate(`/cliente/producto/${producto.idProducto}`)
  }

  const claseChip = (activo) => (activo ? `${styles.chip} ${styles.chipActivo}` : styles.chip)

  return (
    <section className={styles.pagina}>
      <header>
        <h1 className={styles.titulo}>Inicio</h1>
        <p className={styles.subtitulo}>Elige un producto para ver sus detalles y agregarlo a tu carrito.</p>
      </header>

      <div className={styles.columnas}>
        <div className={styles.columnaPrincipal}>
          <div className={styles.tarjeta}>
            <div className={styles.tarjetaEncabezado}>
              <h2 className={styles.tarjetaTitulo}>Productos del menú</h2>
              {!cargando && <span className={styles.contador}>{grupos.length} productos</span>}
            </div>

            <label className={styles.buscador}>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar por nombre del producto"
                aria-label="Buscar producto por nombre"
                value={filtros.nombre}
                onChange={(e) => cambiarFiltro('nombre', e.target.value)}
              />
            </label>

            <div className={styles.chips}>
              <button type="button" className={claseChip(filtros.idCategoria === '')} onClick={() => cambiarFiltro('idCategoria', '')}>
                Todos
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

            {cargando ? (
              <p className={styles.estado}><Cargando texto="Cargando productos..." /></p>
            ) : grupos.length === 0 ? (
              <p className={styles.estado}>No se encontraron productos.</p>
            ) : (
              <div className={styles.cuadricula}>
                {grupos.map((g) => (
                  <TarjetaProducto key={`${g.idCategoria}-${g.nombre}`} grupo={g} onAbrir={() => abrirDetalle(g)} />
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

            <p className={styles.nota}>
              <Info size={14} aria-hidden="true" />
              Los productos agotados no se pueden agregar al pedido.
            </p>
          </div>

          <SugerenciaFormulario />
        </div>

        <PropuestasPanel />
      </div>
    </section>
  )
}

export default InicioClientePage
