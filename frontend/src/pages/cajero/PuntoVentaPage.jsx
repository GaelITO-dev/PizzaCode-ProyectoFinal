import { useEffect, useMemo, useState } from 'react'
import { Banknote, Check, CreditCard, Minus, Pizza, Plus, Search, Trash2 } from 'lucide-react'
import { listarCategorias, listarMenu } from '../../api/productosApi'
import { crearPedidoSucursal } from '../../api/pedidosApi'
import CampoTexto from '../../components/ui/CampoTexto'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'
import { limpiarTelefono } from '../../utils/validaciones'
import { formatearMoneda } from '../../utils/moneda'
import PedidoRegistrado from './PedidoRegistrado'
import SelectorCliente from './SelectorCliente'
import Cargando from '../../components/ui/Cargando'
import styles from './PuntoVentaPage.module.css'

const CLIENTE_VACIO = { nombre: '', telefono: '' }

const MODOS_CLIENTE = [
  { valor: 'CUENTA', texto: 'Con cuenta' },
  { valor: 'SIN', texto: 'Sin cuenta' },
]

const METODOS = [
  { valor: 'EFECTIVO', texto: 'Efectivo', icono: Banknote },
  { valor: 'TARJETA', texto: 'Tarjeta', icono: CreditCard },
]

function validarCobro({ carrito, modoCliente, clienteCuenta, cliente, metodoPago, pagaCon, total }) {
  const errores = {}

  if (carrito.length === 0) {
    errores.carrito = 'Agrega al menos un producto'
  }

  if (modoCliente === 'CUENTA') {
    if (!clienteCuenta) {
      errores.clienteCuenta = 'Busca y elige un cliente, o cambia a Sin cuenta'
    }
  } else {
    if (cliente.nombre.trim().length > 100) {
      errores.nombreCliente = 'El nombre no debe superar los 100 caracteres'
    }
    if (cliente.telefono.trim() && !/^\d{10,15}$/.test(limpiarTelefono(cliente.telefono))) {
      errores.telefonoCliente = 'El teléfono debe contener entre 10 y 15 dígitos'
    }
  }

  if (metodoPago === 'EFECTIVO' && !(Number(pagaCon) >= total)) {
    errores.pagaCon = 'El pago no cubre el total'
  }

  return errores
}

function PuntoVentaPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [intento, setIntento] = useState(0)

  const [categoria, setCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [carrito, setCarrito] = useState([]) // [{ producto, cantidad }]
  const [modoCliente, setModoCliente] = useState('SIN')
  const [clienteCuenta, setClienteCuenta] = useState(null)
  const [cliente, setCliente] = useState(CLIENTE_VACIO)
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [pagaCon, setPagaCon] = useState('')

  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [confirmandoTarjeta, setConfirmandoTarjeta] = useState(false)
  const [registrado, setRegistrado] = useState(null) // { pedido, cambio }

  // El menú se carga una sola vez y se filtra en el navegador: en caja la búsqueda debe ser instantánea
  useEffect(() => {
    let vigente = true

    Promise.all([listarMenu({ size: 100, sort: 'nombre' }), listarCategorias()])
      .then(([menu, listaCategorias]) => {
        if (!vigente) return
        setProductos(menu.content)
        setCategorias(listaCategorias)
        setErrorCarga('')
        setCargando(false)
      })
      .catch((e) => {
        if (!vigente) return
        setErrorCarga(e.mensajeUsuario)
        setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [intento])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return productos.filter((p) => {
      const coincideCategoria = categoria === '' || String(p.idCategoria) === categoria
      const coincideTexto =
        !texto ||
        p.nombre.toLowerCase().includes(texto) ||
        (p.descripcion ?? '').toLowerCase().includes(texto)
      return coincideCategoria && coincideTexto
    })
  }, [productos, categoria, busqueda])

  // La respuesta del pedido no trae la descripción (tamaño); el ticket de cocina la toma de aquí
  const descripciones = useMemo(
    () => Object.fromEntries(productos.map((p) => [p.idProducto, p.descripcion])),
    [productos],
  )

  // Total de referencia en pantalla; el que vale es el que calcula el servidor
  const total = carrito.reduce((suma, r) => suma + Number(r.producto.precio) * r.cantidad, 0)
  const cambio = Number(pagaCon) - total

  function reintentar() {
    setCargando(true)
    setErrorCarga('')
    setIntento((n) => n + 1)
  }

  function cantidadEnTicket(idProducto) {
    return carrito.find((r) => r.producto.idProducto === idProducto)?.cantidad ?? 0
  }

  function agregar(producto) {
    setErrores((actuales) => ({ ...actuales, carrito: undefined }))
    setCarrito((actual) => {
      const existe = actual.some((r) => r.producto.idProducto === producto.idProducto)
      if (existe) {
        return actual.map((r) =>
          r.producto.idProducto === producto.idProducto ? { ...r, cantidad: r.cantidad + 1 } : r,
        )
      }
      return [...actual, { producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(idProducto, diferencia) {
    setCarrito((actual) =>
      actual
        .map((r) => (r.producto.idProducto === idProducto ? { ...r, cantidad: r.cantidad + diferencia } : r))
        .filter((r) => r.cantidad > 0),
    )
  }

  function quitar(idProducto) {
    setCarrito((actual) => actual.filter((r) => r.producto.idProducto !== idProducto))
  }

  function elegirModoCliente(valor) {
    setModoCliente(valor)
    setErrores((actuales) => ({
      ...actuales,
      clienteCuenta: undefined,
      nombreCliente: undefined,
      telefonoCliente: undefined,
    }))
  }

  function elegirClienteCuenta(elegido) {
    setClienteCuenta(elegido)
    setErrores((actuales) => ({ ...actuales, clienteCuenta: undefined }))
  }

  function cambiarCliente(evento) {
    const { name, value } = evento.target
    setCliente((actual) => ({ ...actual, [name]: value }))
    const campo = { nombre: 'nombreCliente', telefono: 'telefonoCliente' }[name]
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }))
  }

  function elegirMetodo(valor) {
    setMetodoPago(valor)
    setErrores((actuales) => ({ ...actuales, pagaCon: undefined }))
  }

  function cobrar() {
    setErrorGeneral('')

    const encontrados = validarCobro({ carrito, modoCliente, clienteCuenta, cliente, metodoPago, pagaCon, total })
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      return
    }

    if (metodoPago === 'TARJETA') {
      setConfirmandoTarjeta(true) // primero se confirma que la terminal aprobó el pago
      return
    }

    registrar()
  }

  async function registrar() {
    setGuardando(true)

    // Con cuenta: el backend liga el pedido a la cuenta por su correo. Sin cuenta: nombre y teléfono.
    const datosCliente =
      modoCliente === 'CUENTA'
        ? { correoCliente: clienteCuenta.correo }
        : {
            nombreCliente: cliente.nombre.trim() || undefined,
            telefonoCliente: limpiarTelefono(cliente.telefono) || undefined,
          }

    try {
      const pedido = await crearPedidoSucursal({
        metodoPago,
        renglones: carrito.map((r) => ({ idProducto: r.producto.idProducto, cantidad: r.cantidad })),
        ...datosCliente,
      })

      setRegistrado({
        pedido,
        cambio: metodoPago === 'EFECTIVO' ? Number(pagaCon) - Number(pedido.total) : null,
      })
      setCarrito([])
      setModoCliente('SIN')
      setClienteCuenta(null)
      setCliente(CLIENTE_VACIO)
      setMetodoPago('EFECTIVO')
      setPagaCon('')
      setErrores({})
    } catch (err) {
      const delServidor = err.response?.data?.errors
      if (delServidor && Object.keys(delServidor).length > 0) {
        setErrores(delServidor)
      }
      setErrorGeneral(err.mensajeUsuario)
    } finally {
      setGuardando(false)
      setConfirmandoTarjeta(false)
    }
  }

  if (registrado) {
    return (
      <PedidoRegistrado
        pedido={registrado.pedido}
        cambio={registrado.cambio}
        descripciones={descripciones}
        onNuevo={() => setRegistrado(null)}
      />
    )
  }

  const claseChip = (activo) => (activo ? `${styles.chip} ${styles.chipActivo}` : styles.chip)

  return (
    <div className={styles.pagina}>
      <section className={styles.menu} aria-labelledby="titulo-punto-venta">
        <header className={styles.encabezado}>
          <h1 id="titulo-punto-venta" className={styles.titulo}>Nuevo pedido</h1>
          <label className={styles.buscador}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar producto"
              aria-label="Buscar producto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>
        </header>

        <div className={styles.chips} role="group" aria-label="Filtrar por categoría">
          <button
            type="button"
            className={claseChip(categoria === '')}
            aria-pressed={categoria === ''}
            onClick={() => setCategoria('')}
          >
            Todos
          </button>
          {categorias.map((c) => (
            <button
              key={c.idCategoria}
              type="button"
              className={claseChip(categoria === String(c.idCategoria))}
              aria-pressed={categoria === String(c.idCategoria)}
              onClick={() => setCategoria(String(c.idCategoria))}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className={styles.estado}><Cargando texto="Cargando menú…" /></p>
        ) : errorCarga ? (
          <div className={styles.estado} role="alert">
            <p>{errorCarga}</p>
            <button type="button" className={styles.botonSecundario} onClick={reintentar}>
              Reintentar
            </button>
          </div>
        ) : visibles.length === 0 ? (
          <p className={styles.estado}>No hay productos que coincidan.</p>
        ) : (
          <ul className={styles.productos}>
            {visibles.map((p) => {
              const enTicket = cantidadEnTicket(p.idProducto)
              return (
                <li key={p.idProducto}>
                  <button
                    type="button"
                    className={enTicket ? `${styles.producto} ${styles.productoEnTicket}` : styles.producto}
                    onClick={() => agregar(p)}
                    aria-label={`Agregar ${p.nombre}, ${formatearMoneda(p.precio)}`}
                  >
                    {p.imagen ? (
                      <img src={p.imagen} alt="" className={styles.imagen} />
                    ) : (
                      <span className={styles.imagen}>
                        <Pizza size={32} aria-hidden="true" />
                      </span>
                    )}
                    <span className={styles.productoTexto}>
                      <span className={styles.productoNombre}>{p.nombre}</span>
                      {p.descripcion && <span className={styles.productoDescripcion}>{p.descripcion}</span>}
                    </span>
                    <span className={styles.productoPie}>
                      <span className={styles.precio}>{formatearMoneda(p.precio)}</span>
                      <span className={styles.agregar} aria-hidden="true">
                        {enTicket > 0 ? enTicket : <Plus size={18} />}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <aside className={styles.ticket} aria-labelledby="titulo-ticket">
        <h2 id="titulo-ticket" className={styles.tituloTicket}>Ticket</h2>

        <fieldset className={styles.grupo}>
          <legend className={styles.etiquetaGrupo}>Cliente</legend>

          <div className={styles.pestanas} role="group" aria-label="Tipo de cliente">
            {MODOS_CLIENTE.map((m) => {
              const activo = modoCliente === m.valor
              return (
                <button
                  key={m.valor}
                  type="button"
                  className={activo ? `${styles.pestana} ${styles.pestanaActiva}` : styles.pestana}
                  aria-pressed={activo}
                  onClick={() => elegirModoCliente(m.valor)}
                >
                  {m.texto}
                </button>
              )
            })}
          </div>

          {modoCliente === 'CUENTA' ? (
            <SelectorCliente
              seleccionado={clienteCuenta}
              onSeleccionar={elegirClienteCuenta}
              error={errores.clienteCuenta}
            />
          ) : (
            <div className={styles.camposCliente}>
              <CampoTexto
                etiqueta="Nombre (opcional)"
                name="nombre"
                value={cliente.nombre}
                onChange={cambiarCliente}
                error={errores.nombreCliente}
                maxLength={100}
                autoComplete="off"
              />
              <CampoTexto
                etiqueta="Teléfono (opcional)"
                tipo="tel"
                name="telefono"
                value={cliente.telefono}
                onChange={cambiarCliente}
                error={errores.telefonoCliente}
                inputMode="numeric"
                maxLength={20}
                autoComplete="off"
              />
            </div>
          )}
        </fieldset>

        <div className={styles.grupo}>
          <p className={styles.etiquetaGrupo}>Productos</p>
          {carrito.length === 0 ? (
            <p className={errores.carrito ? styles.vacioError : styles.vacio} role={errores.carrito ? 'alert' : undefined}>
              {errores.carrito ?? 'Agrega productos del menú.'}
            </p>
          ) : (
            <ul className={styles.renglones}>
              {carrito.map(({ producto, cantidad }) => (
                <li key={producto.idProducto} className={styles.renglon}>
                  <div className={styles.contador}>
                    <button
                      type="button"
                      aria-label={`Quitar uno de ${producto.nombre}`}
                      onClick={() => cambiarCantidad(producto.idProducto, -1)}
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span>{cantidad}</span>
                    <button
                      type="button"
                      aria-label={`Agregar uno de ${producto.nombre}`}
                      onClick={() => cambiarCantidad(producto.idProducto, 1)}
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className={styles.renglonTexto}>
                    <p className={styles.renglonNombre}>{producto.nombre}</p>
                    {producto.descripcion && <p className={styles.renglonDescripcion}>{producto.descripcion}</p>}
                  </div>
                  <p className={styles.renglonPrecio}>{formatearMoneda(Number(producto.precio) * cantidad)}</p>
                  <button
                    type="button"
                    className={styles.quitar}
                    aria-label={`Quitar ${producto.nombre} del ticket`}
                    onClick={() => quitar(producto.idProducto)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.total}>
          <span>Total</span>
          <span>{formatearMoneda(total)}</span>
        </div>

        <div className={styles.grupo}>
          <p id="etiqueta-metodo-pago" className={styles.etiquetaGrupo}>Método de pago</p>
          <div className={styles.metodos} role="group" aria-labelledby="etiqueta-metodo-pago">
            {METODOS.map((m) => {
              const Icono = m.icono
              const activo = metodoPago === m.valor
              return (
                <button
                  key={m.valor}
                  type="button"
                  className={activo ? `${styles.metodo} ${styles.metodoActivo}` : styles.metodo}
                  aria-pressed={activo}
                  onClick={() => elegirMetodo(m.valor)}
                >
                  <Icono size={20} aria-hidden="true" />
                  {m.texto}
                </button>
              )
            })}
          </div>

          {metodoPago === 'EFECTIVO' ? (
            <div className={styles.efectivo}>
              <CampoTexto
                etiqueta="Paga con"
                tipo="number"
                name="pagaCon"
                value={pagaCon}
                onChange={(e) => {
                  setPagaCon(e.target.value)
                  setErrores((actuales) => ({ ...actuales, pagaCon: undefined }))
                }}
                error={errores.pagaCon}
                inputMode="decimal"
                min="0"
                step="0.01"
              />
              <div className={styles.cambio} aria-live="polite">
                <span className={styles.etiquetaCambio}>Cambio</span>
                <span className={styles.montoCambio}>{formatearMoneda(cambio > 0 ? cambio : 0)}</span>
              </div>
            </div>
          ) : (
            <p className={styles.notaTarjeta}>
              Cobra con la terminal. Al presionar Cobrar se te pedirá confirmar que la terminal aprobó el pago.
            </p>
          )}
        </div>

        {errorGeneral && (
          <p className={styles.errorGeneral} role="alert">
            {errorGeneral}
          </p>
        )}

        <button type="button" className={styles.cobrar} onClick={cobrar} disabled={guardando}>
          <Check size={20} aria-hidden="true" />
          {guardando ? 'Registrando…' : `Cobrar ${formatearMoneda(total)}`}
        </button>
      </aside>

      <ModalConfirmacion
        abierto={confirmandoTarjeta}
        titulo="Pago con tarjeta"
        mensaje={`¿La terminal aprobó el pago de ${formatearMoneda(total)}?`}
        cargando={guardando}
        onConfirmar={registrar}
        onCancelar={() => setConfirmandoTarjeta(false)}
      />
    </div>
  )
}

export default PuntoVentaPage
