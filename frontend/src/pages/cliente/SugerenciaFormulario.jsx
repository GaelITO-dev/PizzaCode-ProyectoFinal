import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { crearComentario } from '../../api/comentariosApi'
import BotonPrimario from '../../components/ui/BotonPrimario'
import styles from './SugerenciaFormulario.module.css'

const MAXIMO = 500

function validar(texto) {
  if (!texto.trim()) return 'Escribe tu comentario, queja o sugerencia'
  if (texto.length > MAXIMO) return `Máximo ${MAXIMO} caracteres`
  return ''
}

// Se guarda como SUGERENCIA: es privada, solo la ve el admin en Comentarios
function SugerenciaFormulario() {
  const { usuario } = useAuth()
  const [texto, setTexto] = useState('')
  const [tocado, setTocado] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const nombre = [usuario?.nombre, usuario?.apellidoPat].filter(Boolean).join(' ')

  function cambiarTexto(valor) {
    setTexto(valor)
    setEnviado(false)
    if (tocado) setError(validar(valor))
  }

  async function enviar(e) {
    e.preventDefault()
    setTocado(true)
    const mensaje = validar(texto)
    setError(mensaje)
    if (mensaje) return

    setEnviando(true)
    try {
      await crearComentario({ tipo: 'SUGERENCIA', texto: texto.trim() })
      setTexto('')
      setTocado(false)
      setEnviado(true)
    } catch (err) {
      setError(err.response?.data?.errors?.texto ?? err.mensajeUsuario)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className={styles.tarjeta} onSubmit={enviar} noValidate>
      <h2 className={styles.titulo}>Comentarios, quejas y sugerencias</h2>

      <label className={styles.etiqueta} htmlFor="sugerencia-nombre">Nombre del cliente</label>
      <input id="sugerencia-nombre" className={styles.control} value={nombre} readOnly />

      <label className={styles.etiqueta} htmlFor="sugerencia-texto">Comentario</label>
      <textarea
        id="sugerencia-texto"
        className={error ? `${styles.control} ${styles.controlError}` : styles.control}
        rows={3}
        placeholder="Cuéntanos qué podemos mejorar"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'sugerencia-error' : undefined}
        value={texto}
        onChange={(e) => cambiarTexto(e.target.value)}
      />
      <div className={styles.pie}>
        {error ? (
          <p id="sugerencia-error" className={styles.error}>{error}</p>
        ) : enviado ? (
          <p className={styles.exito} role="status">¡Gracias! Tu mensaje llegó al equipo de Pizza Code.</p>
        ) : (
          <span className={styles.contador}>{texto.length}/{MAXIMO}</span>
        )}
        <div className={styles.boton}>
          <BotonPrimario cargando={enviando} textoCargando="Enviando...">Enviar</BotonPrimario>
        </div>
      </div>
    </form>
  )
}

export default SugerenciaFormulario
