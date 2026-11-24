import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, TrendingDown, TrendingUp } from 'lucide-react'
import { obtenerGanancias } from '../../api/reportesApi'
import { formatearMoneda, formatearMonedaCorta } from '../../utils/moneda'
import { NOMBRE_ORIGEN } from '../../utils/pedidos'
import {
  NOMBRE_PERIODO_ANTERIOR,
  PERIODOS,
  aISO,
  etiquetaDePunto,
  etiquetaDelPeriodo,
  incluyeHoy,
  moverReferencia,
  nombreDePunto,
  rangoDelPeriodo,
} from '../../utils/periodos'
import { descargarReporteCsv } from '../../utils/reporteCsv'
import Cargando from '../../components/ui/Cargando'
import styles from './GananciasPage.module.css'

const NOMBRE_METODO = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta' }
const MAXIMO_BARRAS_CON_VALOR = 14 // con más barras (un mes) los montos no caben: quedan en el tooltip

// Cambio porcentual contra el periodo anterior
function variacion(actual, anterior) {
  const a = Number(actual)
  const b = Number(anterior)
  if (b === 0) {
    return a === 0 ? { texto: 'Sin cambios', tipo: 'neutro' } : { texto: 'Sin ventas en el periodo anterior', tipo: 'neutro' }
  }
  const porcentaje = Math.round(((a - b) / b) * 100)
  return {
    texto: `${Math.abs(porcentaje)}%`,
    tipo: porcentaje > 0 ? 'sube' : porcentaje < 0 ? 'baja' : 'neutro',
  }
}

function Cambio({ cambio, sufijo }) {
  const Icono = cambio.tipo === 'sube' ? TrendingUp : cambio.tipo === 'baja' ? TrendingDown : null
  return (
    <p className={`${styles.cambio} ${styles[cambio.tipo]}`}>
      {Icono && <Icono size={14} aria-hidden="true" />}
      {cambio.texto}
      {sufijo && cambio.tipo !== 'neutro' ? ` ${sufijo}` : ''}
    </p>
  )
}

function Indicador({ etiqueta, valor, children }) {
  return (
    <div className={styles.indicador}>
      <p className={styles.indicadorEtiqueta}>{etiqueta}</p>
      <p className={styles.indicadorValor}>{valor}</p>
      {children}
    </div>
  )
}

function Distribucion({ titulo, grupos, nombres, total }) {
  return (
    <section className={styles.tarjeta} aria-label={titulo}>
      <h2 className={styles.tituloTarjeta}>{titulo}</h2>
      {grupos.length === 0 ? (
        <p className={styles.vacio}>Sin ventas en este periodo.</p>
      ) : (
        <ul className={styles.distribucion}>
          {grupos.map((g, indice) => {
            const porcentaje = total > 0 ? Math.round((Number(g.total) / total) * 100) : 0
            return (
              <li key={g.clave}>
                <div className={styles.filaDistribucion}>
                  <span>{nombres[g.clave] ?? g.clave}</span>
                  <span className={styles.montoDistribucion}>
                    {formatearMoneda(g.total)} · {porcentaje}%
                  </span>
                </div>
                <div className={styles.pista}>
                  <div
                    className={indice === 0 ? styles.relleno : `${styles.relleno} ${styles.rellenoSecundario}`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function GananciasPage() {
  const [periodo, setPeriodo] = useState('SEMANA')
  const [referencia, setReferencia] = useState(() => new Date())
  const [reporte, setReporte] = useState(null)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  const rango = useMemo(() => rangoDelPeriodo(periodo, referencia), [periodo, referencia])
  const desde = aISO(rango.desde)
  const hasta = aISO(rango.hasta)

  useEffect(() => {
    let vigente = true

    obtenerGanancias(desde, hasta)
      .then((datos) => {
        if (!vigente) return
        setReporte(datos)
        setError('')
      })
      .catch((e) => {
        if (vigente) setError(e.mensajeUsuario)
      })

    return () => {
      vigente = false
    }
  }, [desde, hasta, intento])

  // Mientras llega el reporte del periodo nuevo se sigue viendo el anterior, atenuado
  const actualizando = reporte !== null && (reporte.desde !== desde || reporte.hasta !== hasta)
  const anterior = NOMBRE_PERIODO_ANTERIOR[periodo]

  function cambiarPeriodo(valor) {
    setPeriodo(valor)
    setReferencia(new Date())
  }

  const grafica = useMemo(() => {
    if (!reporte) return null
    const serie = reporte.serie
    const maximo = Math.max(0, ...serie.map((p) => Number(p.total)))
    const mejor = serie.reduce((elegido, p) => (Number(p.total) > Number(elegido?.total ?? 0) ? p : elegido), null)
    return { serie, maximo, mejor, compacta: serie.length > MAXIMO_BARRAS_CON_VALOR }
  }, [reporte])

  if (!reporte) {
    return (
      <section className={styles.pagina}>
        <h1 className={styles.titulo}>Ganancias</h1>
        {error ? (
          <div className={styles.estado} role="alert">
            <p>{error}</p>
            <button type="button" className={styles.botonSecundario} onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        ) : (
          <p className={styles.estado}><Cargando texto="Cargando reporte…" /></p>
        )}
      </section>
    )
  }

  const diferenciaPedidos = reporte.pedidos - reporte.pedidosAnterior
  const porHora = reporte.agrupacion === 'HORA'

  return (
    <section className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Ganancias</h1>
          <p className={styles.subtitulo}>Ventas de pedidos no cancelados.</p>
        </div>

        <div className={styles.navegacion}>
          <button
            type="button"
            className={styles.botonFlecha}
            aria-label="Periodo anterior"
            onClick={() => setReferencia((r) => moverReferencia(periodo, r, -1))}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <span className={styles.periodoActual} aria-live="polite">
            {etiquetaDelPeriodo(periodo, rango)}
          </span>
          <button
            type="button"
            className={styles.botonFlecha}
            aria-label="Periodo siguiente"
            disabled={incluyeHoy(rango.hasta)}
            onClick={() => setReferencia((r) => moverReferencia(periodo, r, 1))}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className={styles.pestanas} role="group" aria-label="Periodo">
        {PERIODOS.map((p) => (
          <button
            key={p.valor}
            type="button"
            className={periodo === p.valor ? `${styles.pestana} ${styles.pestanaActiva}` : styles.pestana}
            aria-pressed={periodo === p.valor}
            onClick={() => cambiarPeriodo(p.valor)}
          >
            {p.texto}
          </button>
        ))}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={actualizando ? `${styles.contenido} ${styles.actualizando}` : styles.contenido} aria-busy={actualizando}>
        <div className={styles.indicadores}>
          <Indicador etiqueta="Ventas" valor={formatearMoneda(reporte.ventas)}>
            <Cambio cambio={variacion(reporte.ventas, reporte.ventasAnterior)} sufijo={`vs ${anterior}`} />
          </Indicador>
          <Indicador etiqueta="Pedidos" valor={reporte.pedidos}>
            <Cambio
              cambio={{
                texto:
                  diferenciaPedidos === 0
                    ? 'Igual que el periodo anterior'
                    : `${Math.abs(diferenciaPedidos)} pedidos ${diferenciaPedidos > 0 ? 'más' : 'menos'}`,
                tipo: diferenciaPedidos > 0 ? 'sube' : diferenciaPedidos < 0 ? 'baja' : 'neutro',
              }}
            />
          </Indicador>
          <Indicador etiqueta="Ticket promedio" valor={formatearMoneda(reporte.ticketPromedio)}>
            <Cambio cambio={variacion(reporte.ticketPromedio, reporte.ticketPromedioAnterior)} />
          </Indicador>
          <Indicador etiqueta="Cancelados" valor={reporte.cancelados}>
            <p className={`${styles.cambio} ${reporte.cancelados > 0 ? styles.baja : styles.neutro}`}>
              {formatearMoneda(reporte.montoCancelado)} no cobrados
            </p>
          </Indicador>
        </div>

        <div className={styles.filaMedia}>
          <section className={styles.tarjeta} aria-label={porHora ? 'Ventas por hora' : 'Ventas por día'}>
            <h2 className={styles.tituloTarjeta}>{porHora ? 'Ventas por hora' : 'Ventas por día'}</h2>

            {grafica.serie.length === 0 || grafica.maximo === 0 ? (
              <p className={styles.vacio}>Sin ventas en este periodo.</p>
            ) : (
              <>
                <div className={styles.grafica}>
                  {grafica.serie.map((p) => {
                    const alto = (Number(p.total) / grafica.maximo) * 100
                    const esMejor = p.clave === grafica.mejor?.clave
                    const etiqueta = etiquetaDePunto(reporte.agrupacion, p.clave, grafica.compacta)
                    return (
                      <div
                        key={p.clave}
                        className={styles.columnaGrafica}
                        title={`${etiqueta}: ${formatearMoneda(p.total)} (${p.pedidos} pedidos)`}
                      >
                        <span className={styles.valorBarra}>
                          {!grafica.compacta && Number(p.total) > 0 ? formatearMonedaCorta(p.total) : ''}
                        </span>
                        <div className={styles.carril}>
                          <div
                            className={esMejor ? `${styles.barra} ${styles.barraMejor}` : styles.barra}
                            style={{ height: `${alto}%` }}
                          />
                        </div>
                        <span className={styles.etiquetaBarra}>{etiqueta}</span>
                      </div>
                    )
                  })}
                </div>
                {grafica.mejor && (
                  <p className={styles.nota}>
                    {porHora ? 'La mejor hora fue ' : 'El mejor día fue '}
                    {nombreDePunto(reporte.agrupacion, grafica.mejor.clave)} ({formatearMoneda(grafica.mejor.total)}).
                  </p>
                )}
              </>
            )}
          </section>

          <div className={styles.columnaDerecha}>
            <Distribucion
              titulo="Por origen"
              grupos={reporte.porOrigen}
              nombres={NOMBRE_ORIGEN}
              total={Number(reporte.ventas)}
            />
            <Distribucion
              titulo="Por método de pago"
              grupos={reporte.porMetodoPago}
              nombres={NOMBRE_METODO}
              total={Number(reporte.ventas)}
            />
          </div>
        </div>

        <section className={styles.tarjeta} aria-label="Productos más vendidos">
          <div className={styles.encabezadoTarjeta}>
            <h2 className={styles.tituloTarjeta}>Productos más vendidos</h2>
            <button type="button" className={styles.botonSecundario} onClick={() => descargarReporteCsv(reporte)}>
              <Download size={16} aria-hidden="true" />
              Descargar reporte
            </button>
          </div>

          {reporte.masVendidos.length === 0 ? (
            <p className={styles.vacio}>Sin ventas en este periodo.</p>
          ) : (
            <div className={styles.tablaContenedor}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th className={styles.derecha}>Unidades</th>
                    <th className={styles.derecha}>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.masVendidos.map((p, indice) => (
                    <tr key={p.idProducto}>
                      <td>{indice + 1}</td>
                      <td>{p.nombre}</td>
                      <td className={styles.derecha}>{p.unidades}</td>
                      <td className={`${styles.derecha} ${styles.fuerte}`}>{formatearMoneda(p.ingresos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default GananciasPage
