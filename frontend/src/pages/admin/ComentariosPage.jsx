import { useEffect, useState } from 'react'
import { Eye, EyeOff, Heart, Search, Trash2 } from 'lucide-react'
import {
  listarComentariosAdmin,
  contarComentarios,
  cambiarVisibleComentario,
  eliminarComentario,
  darLike,
  quitarLike,
} from '../../api/comentariosApi'
import Avatar from '../../components/ui/Avatar'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'
import Paginacion from '../../components/ui/Paginacion'
import { fechaNumerica } from '../../utils/fechas'
import base from './ProductosPage.module.css'
import Cargando from '../../components/ui/Cargando'
import styles from './ComentariosPage.module.css'

const TAMANO_PAGINA = 6

// Cada chip se traduce a parámetros del servidor
const FILTROS = [
  { clave: 'todos', texto: 'Todos', params: {} },
  { clave: 'comentarios', texto: 'Comentarios', params: { tipo: 'COMENTARIO' } },
  { clave: 'sugerencias', texto: 'Sugerencias', params: { tipo: 'SUGERENCIA' } },
  { clave: 'ocultos', texto: 'Ocultos', params: { visible: false } },
]

function ComentariosPage() {
  const [comentarios, setComentarios] = useState([])
  const [resumen, setResumen] = useState({ publicados: 0, sugerencias: 0, comentarios: 0, ocultos: 0 })
  const [filtro, setFiltro] = useState('todos')
  const [texto, setTexto] = useState('')
  const [orden, setOrden] = useState('fecha,desc')
  const [pagina, setPagina] = useState(0)
  const [infoPagina, setInfoPagina] = useState({ totalPages: 0, totalElements: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)
  const [aEliminar, setAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // Tarjetas de resumen (las cuenta el servidor)
  useEffect(() => {
    Promise.all([
      contarComentarios({ visible: true }),
      contarComentarios({ tipo: 'SUGERENCIA' }),
      contarComentarios({ tipo: 'COMENTARIO' }),
      contarComentarios({ visible: false }),
    ])
      .then(([publicados, sugerencias, comentariosTotal, ocultos]) =>
        setResumen({ publicados, sugerencias, comentarios: comentariosTotal, ocultos })
      )
      .catch(() => {})
  }, [recargar])

  // Tarjetas de comentarios: filtros, orden y paginación del servidor
  useEffect(() => {
    let vigente = true
    const { params } = FILTROS.find((f) => f.clave === filtro)
    listarComentariosAdmin({
      ...params,
      texto: texto || undefined,
      sort: orden,
      page: pagina,
      size: TAMANO_PAGINA,
    })
      .then((data) => {
        if (!vigente) return
        setComentarios(data.content)
        setInfoPagina(data.page)
        setError('')
      })
      .catch((e) => vigente && setError(e.mensajeUsuario))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [filtro, texto, orden, pagina, recargar])

  // Al cambiar cualquier filtro se vuelve a la página 1
  function aplicar(setter, valor) {
    setCargando(true)
    setter(valor)
    setPagina(0)
  }

  function cambiarPagina(nueva) {
    setCargando(true)
    setPagina(nueva)
  }

  function refrescar() {
    setCargando(true)
    setRecargar((n) => n + 1)
  }

  async function alternarVisible(c) {
    try {
      await cambiarVisibleComentario(c.idComentario, !c.visible)
      refrescar()
    } catch (e) {
      setError(e.mensajeUsuario)
    }
  }

  // Like: solo se actualiza esa tarjeta con lo que responde el servidor
  async function alternarLike(c) {
    try {
      const r = c.yaDioLike ? await quitarLike(c.idComentario) : await darLike(c.idComentario)
      setComentarios((lista) =>
        lista.map((x) =>
          x.idComentario === r.idComentario ? { ...x, totalLikes: r.totalLikes, yaDioLike: r.yaDioLike } : x
        )
      )
    } catch (e) {
      setError(e.mensajeUsuario)
    }
  }

  async function confirmarEliminar() {
    setEliminando(true)
    try {
      await eliminarComentario(aEliminar.idComentario)
      refrescar()
    } catch (e) {
      setError(e.mensajeUsuario)
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  const claseChip = (activo) => (activo ? `${base.chip} ${base.chipActivo}` : base.chip)

  return (
    <section className={base.pagina}>
      <header>
        <h1 className={base.titulo}>Comentarios y sugerencias</h1>
        <p className={base.subtitulo}>
          Revisa lo que publican los clientes. Oculta o elimina lo que no cumpla las reglas.
        </p>
      </header>

      <div className={base.resumen}>
        <div className={base.dato}>
          <p className={base.datoEtiqueta}>Publicados</p>
          <p className={base.datoValor}>{resumen.publicados}</p>
        </div>
        <div className={base.dato}>
          <p className={base.datoEtiqueta}>Sugerencias</p>
          <p className={base.datoValor}>{resumen.sugerencias}</p>
        </div>
        <div className={base.dato}>
          <p className={base.datoEtiqueta}>Comentarios</p>
          <p className={base.datoValor}>{resumen.comentarios}</p>
        </div>
        <div className={base.dato}>
          <p className={base.datoEtiqueta}>Ocultos</p>
          <p className={base.datoValor}>{resumen.ocultos}</p>
        </div>
      </div>

      <div className={styles.barra}>
        <div className={`${base.chips} ${styles.sinMargen}`}>
          {FILTROS.map((f) => (
            <button
              key={f.clave}
              type="button"
              className={claseChip(filtro === f.clave)}
              onClick={() => aplicar(setFiltro, f.clave)}
            >
              {f.texto}
            </button>
          ))}
        </div>
        <div className={styles.derecha}>
          <label className={base.buscador}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por usuario o texto"
              aria-label="Buscar por usuario o texto"
              value={texto}
              onChange={(e) => aplicar(setTexto, e.target.value)}
            />
          </label>
          <select
            className={styles.ordenar}
            aria-label="Ordenar comentarios"
            value={orden}
            onChange={(e) => aplicar(setOrden, e.target.value)}
          >
            <option value="fecha,desc">Más recientes</option>
            <option value="fecha,asc">Más antiguos</option>
          </select>
        </div>
      </div>

      {error && <p className={base.error} role="alert">{error}</p>}

      <div className={styles.cuadricula}>
        {cargando ? (
          <p className={styles.mensaje}><Cargando texto="Cargando comentarios..." /></p>
        ) : comentarios.length === 0 ? (
          <p className={styles.mensaje}>No se encontraron comentarios.</p>
        ) : (
          comentarios.map((c) => (
            <article key={c.idComentario} className={c.visible ? styles.comentario : `${styles.comentario} ${styles.oculto}`}>
              <div className={styles.cabecera}>
                <Avatar nombre={c.nombreUsuario} tamano="pequeno" />
                <div className={styles.autor}>
                  <p className={styles.nombre}>{c.nombreUsuario}</p>
                  <p className={styles.fecha}>{fechaNumerica(c.fecha)}</p>
                </div>
                <div className={styles.insignias}>
                  <span className={`${styles.insignia} ${styles[c.tipo]}`}>
                    {c.tipo === 'COMENTARIO' ? 'Comentario' : 'Sugerencia'}
                  </span>
                  <span className={`${styles.insignia} ${c.visible ? styles.visible : styles.escondido}`}>
                    {c.visible ? '● Visible' : '● Oculto'}
                  </span>
                </div>
              </div>

              <p className={styles.texto}>{c.texto}</p>

              <div className={styles.pie}>
                <button type="button" className={styles.botonGris} onClick={() => alternarVisible(c)}>
                  {c.visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  {c.visible ? 'Ocultar' : 'Mostrar'}
                </button>
                <button type="button" className={styles.botonRojo} onClick={() => setAEliminar(c)}>
                  <Trash2 size={16} aria-hidden="true" />
                  Eliminar
                </button>

                {/* Solo los comentarios son públicos y reciben likes; las sugerencias son privadas */}
                {c.tipo === 'COMENTARIO' && (
                  <button
                    type="button"
                    className={c.yaDioLike ? `${styles.like} ${styles.conLike}` : styles.like}
                    disabled={!c.visible}
                    aria-pressed={c.yaDioLike}
                    aria-label={`${c.yaDioLike ? 'Quitar' : 'Dar'} me gusta. ${c.totalLikes} en total`}
                    onClick={() => alternarLike(c)}
                  >
                    <Heart size={16} fill={c.yaDioLike ? 'currentColor' : 'none'} aria-hidden="true" />
                    {c.totalLikes}
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <Paginacion
        pagina={pagina}
        totalPaginas={infoPagina.totalPages}
        totalElementos={infoPagina.totalElements}
        tamano={TAMANO_PAGINA}
        onCambiar={cambiarPagina}
      />

      <ModalConfirmacion
        abierto={aEliminar !== null}
        titulo="Eliminar comentario"
        mensaje="¿Seguro que quieres eliminarlo? Si solo no cumple las reglas, puedes ocultarlo."
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  )
}

export default ComentariosPage
