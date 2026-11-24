import { useEffect, useMemo, useState } from 'react'
import { Printer, RefreshCw, Search } from 'lucide-react'
import { listarPedidos } from '../../api/pedidosApi'
import { listarMenu } from '../../api/productosApi'
import { formatearMoneda } from '../../utils/moneda'
import { imprimirTicket } from '../../utils/impresion'
import { NOMBRE_ORIGEN, fechaDeHoy, formatearHora, resumenProductos, tituloDelDia } from '../../utils/pedidos'
import TicketCocina from './TicketCocina'
import Cargando from '../../components/ui/Cargando'
import styles from './HistorialDiaPage.module.css'

const ESTADOS = [
  { valor: '', texto: 'Todos' },
  { valor: 'RECIBIDO', texto: 'Recibido' },
  { valor: 'EN_PREPARACION', texto: 'En preparación' },
  { valor: 'LISTO', texto: 'Listo' },
  { valor: 'ENTREGADO', texto: 'Entregado' },
  { valor: 'CANCELADO', texto: 'Cancelado' },
]

const NOMBRE_ESTADO = Object.fromEntries(ESTADOS.filter((e) => e.valor).map((e) => [e.valor, e.texto]))
const NOMBRE_METODO = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta' }

const CLASE_ESTADO = {
  RECIBIDO: styles.recibido,
  EN_PREPARACION: styles.preparacion,
  LISTO: styles.listo,
  ENTREGADO: styles.entregado,
  CANCELADO: styles.cancelado,
}

const FILTROS_VACIOS = { estado: '', origen: '', metodo: '', busqueda: '' }

function Dato({ etiqueta, valor }) {
  return (
    <div className={styles.dato}>
      <p className={styles.datoEtiqueta}>{etiqueta}</p>
      <p className={styles.datoValor}>{valor}</p>
    </div>
  )
}

function HistorialDiaPage() {
  const [pedidos, setPedidos] = useState([])
  const [descripciones, setDescripciones] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [recargar, setRecargar] = useState(0)
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [ticket, setTicket] = useState(null)

  // Descripciones (tamaño) para reimprimir el ticket de cocina
  useEffect(() => {
    listarMenu({ size: 100 })
      .then((menu) => setDescripciones(Object.fromEntries(menu.content.map((p) => [p.idProducto, p.descripcion]))))
      .catch(() => {})
  }, [])

  // Todos los pedidos de hoy (máximo 100), los más recientes primero
  useEffect(() => {
    let vigente = true
    const hoy = fechaDeHoy()

    listarPedidos({ desde: hoy, hasta: hoy, size: 100, sort: 'fecha,desc' })
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

  useEffect(() => {
    if (ticket) imprimirTicket()
  }, [ticket])

  // Corte de caja: lo vendido en el día sin contar los cancelados
  const corte = useMemo(() => {
    const validos = pedidos.filter((p) => p.estado !== 'CANCELADO')
    const sumar = (lista) => lista.reduce((suma, p) => suma + Number(p.total), 0)
    return {
      pedidos: validos.length,
      vendido: sumar(validos),
      efectivo: sumar(validos.filter((p) => p.metodoPago === 'EFECTIVO')),
      tarjeta: sumar(validos.filter((p) => p.metodoPago === 'TARJETA')),
      cancelados: pedidos.length - validos.length,
    }
  }, [pedidos])

  // Los filtros se aplican en el navegador: ya están cargados todos los pedidos del día
  const visibles = useMemo(() => {
    const texto = filtros.busqueda.trim().toLowerCase().replace('#', '')
    return pedidos.filter(
      (p) =>
        (!filtros.estado || p.estado === filtros.estado) &&
        (!filtros.origen || p.origen === filtros.origen) &&
        (!filtros.metodo || p.metodoPago === filtros.metodo) &&
        (!texto ||
          String(p.idPedido).includes(texto) ||
          (p.nombreCliente ?? '').toLowerCase().includes(texto)),
    )
  }, [pedidos, filtros])

  function cambiarFiltro(nombre, valor) {
    setFiltros((actuales) => ({ ...actuales, [nombre]: valor }))
  }

  function reimprimir(pedido) {
    setTicket({ ...pedido, renglones: pedido.productos ?? [] })
  }

  const claseChip = (activo) => (activo ? `${styles.chip} ${styles.chipActivo}` : styles.chip)

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Historial del día</h1>
          <p className={styles.subtitulo}>{tituloDelDia()} · corte de caja y pedidos del turno</p>
        </div>
        <button type="button" className={styles.botonActualizar} onClick={() => setRecargar((n) => n + 1)}>
          <RefreshCw size={16} aria-hidden="true" />
          Actualizar
        </button>
      </header>

      <div className={styles.resumen}>
        <Dato etiqueta="Pedidos" valor={corte.pedidos} />
        <Dato etiqueta="Vendido" valor={formatearMoneda(corte.vendido)} />
        <Dato etiqueta="Efectivo" valor={formatearMoneda(corte.efectivo)} />
        <Dato etiqueta="Tarjeta" valor={formatearMoneda(corte.tarjeta)} />
        <Dato etiqueta="Cancelados" valor={corte.cancelados} />
      </div>

      <div className={styles.tarjeta}>
        <div className={styles.barraFiltros}>
          <div className={styles.chips} role="group" aria-label="Filtrar por estado">
            {ESTADOS.map((e) => (
              <button
                key={e.valor || 'todos'}
                type="button"
                className={claseChip(filtros.estado === e.valor)}
                aria-pressed={filtros.estado === e.valor}
                onClick={() => cambiarFiltro('estado', e.valor)}
              >
                {e.texto}
              </button>
            ))}
          </div>

          <div className={styles.controles}>
            <label className={styles.buscador}>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar por número o cliente"
                aria-label="Buscar pedido por número o cliente"
                value={filtros.busqueda}
                onChange={(e) => cambiarFiltro('busqueda', e.target.value)}
              />
            </label>
            <select
              className={styles.selector}
              aria-label="Filtrar por origen"
              value={filtros.origen}
              onChange={(e) => cambiarFiltro('origen', e.target.value)}
            >
              <option value="">Origen: Todos</option>
              <option value="SUCURSAL">Origen: Sucursal</option>
              <option value="EN_LINEA">Origen: En línea</option>
            </select>
            <select
              className={styles.selector}
              aria-label="Filtrar por método de pago"
              value={filtros.metodo}
              onChange={(e) => cambiarFiltro('metodo', e.target.value)}
            >
              <option value="">Pago: Todos</option>
              <option value="EFECTIVO">Pago: Efectivo</option>
              <option value="TARJETA">Pago: Tarjeta</option>
            </select>
          </div>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Origen</th>
                <th>Pago</th>
                <th>Estado</th>
                <th className={styles.derecha}>Total</th>
                <th className={styles.derecha}>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={8} className={styles.vacio}><Cargando texto="Cargando pedidos…" /></td>
                </tr>
              ) : visibles.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.vacio}>No hay pedidos que coincidan.</td>
                </tr>
              ) : (
                visibles.map((p) => {
                  const cancelado = p.estado === 'CANCELADO'
                  return (
                    <tr key={p.idPedido}>
                      <td>
                        <p className={styles.numero}>#{p.idPedido}</p>
                        <p className={styles.secundario}>{formatearHora(p.fecha)}</p>
                      </td>
                      <td>{p.nombreCliente || 'Mostrador'}</td>
                      <td className={styles.productos}>{resumenProductos(p.productos)}</td>
                      <td>{NOMBRE_ORIGEN[p.origen] ?? p.origen}</td>
                      <td>{NOMBRE_METODO[p.metodoPago] ?? p.metodoPago}</td>
                      <td>
                        <span className={`${styles.estado} ${CLASE_ESTADO[p.estado] ?? ''}`}>
                          {NOMBRE_ESTADO[p.estado] ?? p.estado}
                        </span>
                        {cancelado && p.motivoCancelacion && (
                          <p className={styles.motivo}>Motivo: {p.motivoCancelacion}</p>
                        )}
                      </td>
                      <td className={cancelado ? `${styles.total} ${styles.anulado}` : styles.total}>
                        {formatearMoneda(p.total)}
                      </td>
                      <td className={styles.derecha}>
                        {!cancelado && (
                          <button
                            type="button"
                            className={styles.botonTicket}
                            aria-label={`Reimprimir ticket del pedido #${p.idPedido}`}
                            title="Reimprimir ticket de cocina"
                            onClick={() => reimprimir(p)}
                          >
                            <Printer size={16} aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!cargando && pedidos.length >= 100 && (
          <p className={styles.aviso}>Se muestran los 100 pedidos más recientes del día.</p>
        )}
      </div>

      {ticket && <TicketCocina pedido={ticket} descripciones={descripciones} />}
    </section>
  )
}

export default HistorialDiaPage
