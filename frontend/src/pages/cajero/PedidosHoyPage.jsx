import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus, Printer, ShoppingBag, X } from 'lucide-react'
import { cambiarEstadoPedido, cancelarPedido, listarPedidos } from '../../api/pedidosApi'
import { listarMenu } from '../../api/productosApi'
import ModalMotivo from '../../components/ui/ModalMotivo'
import { imprimirTicket } from '../../utils/impresion'
import { NOMBRE_ORIGEN, fechaDeHoy, formatearHora, resumenProductos, tituloDelDia } from '../../utils/pedidos'
import TicketCocina from './TicketCocina'
import styles from './PedidosHoyPage.module.css'

const INTERVALO_ACTUALIZACION_MS = 30000

// Una columna por estado; la acción solo avanza un paso (igual que la regla del backend)
const COLUMNAS = [
  {
    estado: 'RECIBIDO',
    titulo: 'Por imprimir',
    clasePunto: 'puntoRecibido',
    accion: { texto: 'Imprimir ticket', icono: Printer, siguiente: 'EN_PREPARACION', imprime: true },
  },
  {
    estado: 'EN_PREPARACION',
    titulo: 'En preparación',
    clasePunto: 'puntoPreparacion',
    accion: { texto: 'Marcar listo', icono: Check, siguiente: 'LISTO' },
  },
  {
    estado: 'LISTO',
    titulo: 'Listo',
    clasePunto: 'puntoListo',
    accion: { texto: 'Entregar', icono: ShoppingBag, siguiente: 'ENTREGADO', secundaria: true },
  },
  {
    estado: 'ENTREGADO',
    titulo: 'Entregado',
    clasePunto: 'puntoEntregado',
    accion: null,
  },
]

function PedidosHoyPage() {
  const [pedidos, setPedidos] = useState([])
  const [descripciones, setDescripciones] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)
  const [enCurso, setEnCurso] = useState(null)
  const [aCancelar, setACancelar] = useState(null)
  const [ticket, setTicket] = useState(null)

  // Descripciones (tamaño) para el ticket de cocina; si falla, el ticket sale sin ellas
  useEffect(() => {
    listarMenu({ size: 100 })
      .then((menu) => setDescripciones(Object.fromEntries(menu.content.map((p) => [p.idProducto, p.descripcion]))))
      .catch(() => {})
  }, [])

  // Pedidos de hoy: los más antiguos primero (primero en llegar, primero en prepararse)
  useEffect(() => {
    let vigente = true
    const hoy = fechaDeHoy()

    listarPedidos({ desde: hoy, hasta: hoy, size: 100, sort: 'fecha,asc' })
      .then((data) => {
        if (!vigente) return
        setPedidos(data.content)
        setError('')
        setCargando(false)
      })
      .catch((e) => {
        if (!vigente) return
        setError(e.mensajeUsuario)
        setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [recargar])

  // Se actualiza sola para que aparezcan los pedidos en línea sin recargar la página
  useEffect(() => {
    const id = setInterval(() => setRecargar((n) => n + 1), INTERVALO_ACTUALIZACION_MS)
    return () => clearInterval(id)
  }, [])

  // En cuanto hay un ticket que imprimir, se abre el diálogo de impresión
  useEffect(() => {
    if (ticket) imprimirTicket()
  }, [ticket])

  const porEstado = useMemo(() => {
    const grupos = Object.fromEntries(COLUMNAS.map((c) => [c.estado, []]))
    for (const p of pedidos) {
      grupos[p.estado]?.push(p)
    }
    grupos.ENTREGADO.reverse() // los entregados más recientes arriba
    return grupos
  }, [pedidos])

  const cancelados = pedidos.filter((p) => p.estado === 'CANCELADO').length

  function refrescar() {
    setRecargar((n) => n + 1)
  }

  async function avanzar(pedido, accion) {
    setEnCurso(pedido.idPedido)
    setError('')

    try {
      await cambiarEstadoPedido(pedido.idPedido, accion.siguiente)
      if (accion.imprime) {
        setTicket({ ...pedido, renglones: pedido.productos ?? [] })
      }
    } catch (e) {
      setError(e.mensajeUsuario) // por ejemplo, otro cajero ya lo avanzó (422)
    } finally {
      setEnCurso(null)
      refrescar()
    }
  }

  async function confirmarCancelacion(motivo) {
    await cancelarPedido(aCancelar.idPedido, motivo)
    setACancelar(null)
    refrescar()
  }

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Pedidos de hoy</h1>
          <p className={styles.subtitulo}>
            {tituloDelDia()} · {pedidos.length} pedidos
            {cancelados > 0 && ` · ${cancelados} cancelados`}
          </p>
        </div>
        <Link to="/cajero" className={styles.botonNuevo}>
          <Plus size={18} aria-hidden="true" />
          Nuevo pedido
        </Link>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {cargando ? (
        <p className={styles.estado}>Cargando pedidos…</p>
      ) : (
        <div className={styles.tablero}>
          {COLUMNAS.map((columna) => {
            const lista = porEstado[columna.estado]
            const accion = columna.accion
            const Icono = accion?.icono

            return (
              <section key={columna.estado} className={styles.columna} aria-labelledby={`columna-${columna.estado}`}>
                <h2 id={`columna-${columna.estado}`} className={styles.tituloColumna}>
                  <span className={`${styles.punto} ${styles[columna.clasePunto]}`} aria-hidden="true" />
                  {columna.titulo}
                  <span className={styles.contador}>{lista.length}</span>
                </h2>

                {lista.length === 0 ? (
                  <p className={styles.vacio}>Sin pedidos</p>
                ) : (
                  <ul className={styles.tarjetas}>
                    {lista.map((p) => {
                      const ocupado = enCurso === p.idPedido
                      return (
                        <li
                          key={p.idPedido}
                          className={accion ? styles.tarjeta : `${styles.tarjeta} ${styles.tarjetaTerminada}`}
                        >
                          <div className={styles.cabecera}>
                            <span className={styles.numero}>#{p.idPedido}</span>
                            <span className={styles.origen}>{NOMBRE_ORIGEN[p.origen] ?? p.origen}</span>
                            <span className={styles.hora}>{formatearHora(p.fecha)}</span>
                          </div>
                          <p className={styles.cliente}>{p.nombreCliente || 'Mostrador'}</p>
                          <p className={styles.productos}>{resumenProductos(p.productos)}</p>

                          {accion && (
                            <div className={styles.acciones}>
                              <button
                                type="button"
                                className={accion.secundaria ? styles.botonSecundario : styles.botonPrimario}
                                disabled={ocupado}
                                onClick={() => avanzar(p, accion)}
                              >
                                <Icono size={16} aria-hidden="true" />
                                {ocupado ? 'Guardando…' : accion.texto}
                              </button>
                              <button
                                type="button"
                                className={styles.botonCancelar}
                                aria-label={`Cancelar pedido #${p.idPedido}`}
                                title="Cancelar pedido"
                                disabled={ocupado}
                                onClick={() => setACancelar(p)}
                              >
                                <X size={16} aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}

      {aCancelar && (
        <ModalMotivo
          titulo="Cancelar pedido"
          mensaje={
            <>
              ¿Cancelar el pedido <strong>#{aCancelar.idPedido}</strong> de {aCancelar.nombreCliente || 'Mostrador'}? Esta
              acción no se puede deshacer.
            </>
          }
          placeholder="Ej. El cliente ya no lo quiso"
          textoAccion="Cancelar pedido"
          textoGuardando="Cancelando…"
          textoCerrar="Volver"
          icono={X}
          onConfirmar={confirmarCancelacion}
          onCerrar={() => setACancelar(null)}
        />
      )}

      {ticket && <TicketCocina pedido={ticket} descripciones={descripciones} />}
    </section>
  )
}

export default PedidosHoyPage
