import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { buscarClientes } from '../../api/clientesApi'
import Avatar from '../../components/ui/Avatar'
import { formatearTelefono } from '../../utils/telefono'
import styles from './SelectorCliente.module.css'

const MINIMO = 2
const ESPERA_MS = 300

// Busca un cliente con cuenta (espera 300 ms después de escribir) o muestra el elegido
function SelectorCliente({ seleccionado, onSeleccionar, error }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState('')

  useEffect(() => {
    const texto = busqueda.trim()
    if (texto.length < MINIMO) return undefined

    let vigente = true
    const temporizador = setTimeout(() => {
      buscarClientes(texto)
        .then((lista) => {
          if (!vigente) return
          setResultados(lista)
          setErrorBusqueda('')
        })
        .catch((e) => {
          if (vigente) setErrorBusqueda(e.mensajeUsuario)
        })
        .finally(() => {
          if (vigente) setBuscando(false)
        })
    }, ESPERA_MS)

    return () => {
      vigente = false
      clearTimeout(temporizador)
    }
  }, [busqueda])

  function cambiar(evento) {
    const valor = evento.target.value
    setBusqueda(valor)
    if (valor.trim().length < MINIMO) {
      setResultados([])
      setErrorBusqueda('')
      setBuscando(false)
    } else {
      setBuscando(true)
    }
  }

  function cambiarCliente() {
    onSeleccionar(null)
    setBusqueda('')
    setResultados([])
  }

  if (seleccionado) {
    return (
      <div className={styles.seleccionado}>
        <Avatar nombre={seleccionado.nombre} apellido={seleccionado.apellidoPat} />
        <div className={styles.datos}>
          <p className={styles.nombre}>
            {seleccionado.nombre} {seleccionado.apellidoPat}
          </p>
          <p className={styles.detalle}>
            {formatearTelefono(seleccionado.telefono)} · {seleccionado.correo}
          </p>
        </div>
        <button type="button" className={styles.cambiar} onClick={cambiarCliente}>
          Cambiar
        </button>
      </div>
    )
  }

  const texto = busqueda.trim()

  return (
    <div className={styles.selector}>
      <label className={error ? `${styles.buscador} ${styles.conError}` : styles.buscador}>
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar por nombre, correo o teléfono"
          aria-label="Buscar cliente con cuenta"
          value={busqueda}
          onChange={cambiar}
          autoFocus
        />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {errorBusqueda && (
        <p className={styles.error} role="alert">
          {errorBusqueda}
        </p>
      )}

      {texto.length > 0 && texto.length < MINIMO && (
        <p className={styles.estado}>Escribe al menos {MINIMO} caracteres.</p>
      )}

      {texto.length >= MINIMO &&
        (buscando ? (
          <p className={styles.estado}>Buscando…</p>
        ) : resultados.length === 0 ? (
          <p className={styles.estado}>No se encontraron clientes.</p>
        ) : (
          <ul className={styles.resultados}>
            {resultados.map((c) => (
              <li key={c.idUsuario}>
                <button type="button" className={styles.resultado} onClick={() => onSeleccionar(c)}>
                  <Avatar nombre={c.nombre} apellido={c.apellidoPat} />
                  <span className={styles.datos}>
                    <span className={styles.nombre}>
                      {c.nombre} {c.apellidoPat}
                    </span>
                    <span className={styles.detalle}>
                      {formatearTelefono(c.telefono)} · {c.correo}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}

export default SelectorCliente
