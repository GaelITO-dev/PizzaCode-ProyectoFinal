import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { crearComentario, darLike, listarComentariosPublicos, quitarLike } from '../../api/comentariosApi'
import Avatar from '../../components/ui/Avatar'
import Paginacion from '../../components/ui/Paginacion'
import { fechaNumerica } from '../../utils/fechas'
import styles from './PropuestasPanel.module.css'

const TAMANO_PAGINA = 5
const MAXIMO = 500

function validar(texto) {
  if (!texto.trim()) return 'Escribe tu propuesta'
  if (texto.length > MAXIMO) return `Máximo ${MAXIMO} caracteres`
  return ''
}

// Comentarios públicos (tipo COMENTARIO) con likes. El cliente puede proponer su pizza.
function PropuestasPanel() {
  const [comentarios, setComentarios] = useState([])
  const [pagina, setPagina] = useState(0)
  const [infoPagina, setInfoPagina] = useState({ totalPages: 0, totalElements: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)

  const [texto, setTexto] = useState('')
  const [tocado, setTocado] = useState(false)
  const [errorTexto, setErrorTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let vigente = true
    listarComentariosPublicos({ page: pagina, size: TAMANO_PAGINA })
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
  }, [pagina, recargar])

  function cambiarPagina(nueva) {
    setCargando(true)
    setPagina(nueva)
  }

  // El servidor responde el total actualizado; solo se cambia ese comentario en la lista
  async function alternarLike(comentario) {
    try {
      const r = comentario.yaDioLike ? await quitarLike(comentario.idComentario) : await darLike(comentario.idComentario)
      setComentarios((lista) =>
        lista.map((c) =>
          c.idComentario === r.idComentario ? { ...c, totalLikes: r.totalLikes, yaDioLike: r.yaDioLike } : c
        )
      )
    } catch (e) {
      setError(e.mensajeUsuario)
    }
  }

  function cambiarTexto(valor) {
    setTexto(valor)
    if (tocado) setErrorTexto(validar(valor)) // validación en tiempo real después del primer intento
  }

  async function enviar(e) {
    e.preventDefault()
    setTocado(true)
    const mensaje = validar(texto)
    setErrorTexto(mensaje)
    if (mensaje) return

    setEnviando(true)
    try {
      await crearComentario({ tipo: 'COMENTARIO', texto: texto.trim() })
      setTexto('')
      setTocado(false)
      setCargando(true)
      setPagina(0)
      setRecargar((n) => n + 1) // la nueva propuesta aparece primero (orden por fecha)
    } catch (err) {
      setErrorTexto(err.response?.data?.errors?.texto ?? err.mensajeUsuario)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <aside className={styles.panel}>
      <h2 className={styles.titulo}>Propuestas de Pizza</h2>
      <p className={styles.subtitulo}>¡Haremos la pizza del comentario más votado de la semana!</p>
      <p className={styles.contador}>{infoPagina.totalElements} comentarios</p>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {cargando ? (
        <p className={styles.estado}>Cargando propuestas...</p>
      ) : comentarios.length === 0 ? (
        <p className={styles.estado}>Todavía no hay propuestas. ¡Sé el primero!</p>
      ) : (
        <ul className={styles.lista}>
          {comentarios.map((c) => (
            <li key={c.idComentario} className={styles.comentario}>
              <Avatar nombre={c.nombreUsuario} />
              <div className={styles.cuerpo}>
                <div className={styles.cabecera}>
                  <span className={styles.autor}>{c.nombreUsuario}</span>
                  <span className={styles.fecha}>{fechaNumerica(c.fecha)}</span>
                </div>
                <p className={styles.texto}>{c.texto}</p>
              </div>
              <button
                type="button"
                className={c.yaDioLike ? `${styles.like} ${styles.likeActivo}` : styles.like}
                aria-label={c.yaDioLike ? 'Quitar me gusta' : 'Me gusta'}
                aria-pressed={c.yaDioLike}
                onClick={() => alternarLike(c)}
              >
                <Heart size={16} aria-hidden="true" />
                <span>{c.totalLikes}</span>
              </button>
            </li>
          ))}
        </ul>
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

      <form className={styles.formulario} onSubmit={enviar} noValidate>
        <div className={errorTexto ? `${styles.campo} ${styles.campoError}` : styles.campo}>
          <input
            type="text"
            placeholder="Escribe tu propuesta"
            aria-label="Escribe tu propuesta"
            aria-invalid={Boolean(errorTexto)}
            value={texto}
            onChange={(e) => cambiarTexto(e.target.value)}
          />
          <button type="submit" className={styles.enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
        {errorTexto && <p className={styles.errorCampo}>{errorTexto}</p>}
      </form>
    </aside>
  )
}

export default PropuestasPanel
