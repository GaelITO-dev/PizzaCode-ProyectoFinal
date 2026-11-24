import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, CreditCard, Lock, ShieldCheck, Store, User } from 'lucide-react'
import { obtenerPerfilApi, actualizarPerfilApi } from '../../api/perfilApi'
import { crearPedidoEnLinea } from '../../api/pedidosClienteApi'
import { useCarrito } from '../../carrito/useCarrito'
import { useDescuentos } from '../../carrito/useDescuentos'
import BotonPrimario from '../../components/ui/BotonPrimario'
import { formatearMoneda } from '../../utils/moneda'
import PasosCompra from './PasosCompra'
import styles from './PagoPage.module.css'

const CANALES = [
  { valor: 'CORREO', texto: 'Ticket por correo' },
  { valor: 'WHATSAPP', texto: 'Ticket por WhatsApp' },
  { valor: 'AMBOS', texto: 'Los dos' },
]

const TARJETA_VACIA = { numero: '', nombre: '', vencimiento: '', cvv: '' }

// ---------- Validaciones de la tarjeta (es un pago simulado: no se manda ni se guarda) ----------
function validarTarjeta(t) {
  const errores = {}
  if (!t.numero) errores.numero = 'El número de tarjeta es obligatorio'
  else if (t.numero.length !== 16) errores.numero = 'El número debe tener 16 dígitos'

  if (!t.nombre.trim()) errores.nombre = 'El nombre es obligatorio'
  else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,}$/.test(t.nombre.trim())) errores.nombre = 'Solo letras y espacios (mínimo 3)'

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(t.vencimiento)) {
    errores.vencimiento = 'Usa el formato MM/AA'
  } else {
    const [mes, anio] = t.vencimiento.split('/').map(Number)
    const hoy = new Date()
    const anioActual = hoy.getFullYear() % 100
    if (anio < anioActual || (anio === anioActual && mes < hoy.getMonth() + 1)) {
      errores.vencimiento = 'La tarjeta está vencida'
    }
  }

  if (!/^\d{3,4}$/.test(t.cvv)) errores.cvv = 'El CVV tiene 3 o 4 dígitos'
  return errores
}

// Solo dígitos; el número se muestra en grupos de 4 y el vencimiento como MM/AA
const soloDigitos = (texto, maximo) => texto.replace(/\D/g, '').slice(0, maximo)
const agruparNumero = (numero) => numero.replace(/(\d{4})(?=\d)/g, '$1 ')
function formatearVencimiento(texto) {
  const d = soloDigitos(texto, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

function Campo({ etiqueta, icono: Icono, error, children }) {
  return (
    <label className={styles.campo}>
      <span className={styles.etiqueta}>{etiqueta}</span>
      <span className={error ? `${styles.control} ${styles.controlError}` : styles.control}>
        <Icono size={16} aria-hidden="true" />
        {children}
      </span>
      {error && <span className={styles.errorCampo}>{error}</span>}
    </label>
  )
}

function PagoPage() {
  const navigate = useNavigate()
  const { items, vaciar } = useCarrito()
  const { precioDe, totales } = useDescuentos()
  const { subtotal, descuento, total } = totales(items)
  const [perfil, setPerfil] = useState(null)
  const [canal, setCanal] = useState('AMBOS')
  const [metodo, setMetodo] = useState('TARJETA')
  const [tarjeta, setTarjeta] = useState(TARJETA_VACIA)
  const [tocados, setTocados] = useState({})
  const [intento, setIntento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [confirmado, setConfirmado] = useState(false)

  // El canal guardado en el perfil es la opción marcada al entrar
  useEffect(() => {
    obtenerPerfilApi()
      .then((p) => {
        setPerfil(p)
        if (p.canalTicket) setCanal(p.canalTicket)
      })
      .catch(() => {})
  }, [])

  // Sin productos no hay nada que pagar (excepto justo después de confirmar, que el carrito ya se vació)
  if (items.length === 0 && !confirmado) return <Navigate to="/cliente/carrito" replace />

  const errores = metodo === 'TARJETA' ? validarTarjeta(tarjeta) : {}
  // El error se ve en tiempo real una vez que el usuario tocó el campo, o al intentar pagar
  const errorDe = (campo) => (tocados[campo] || intento ? errores[campo] : undefined)

  function cambiar(campo, valor) {
    setTarjeta({ ...tarjeta, [campo]: valor })
    setTocados({ ...tocados, [campo]: true })
  }

  async function pagar(e) {
    e.preventDefault()
    setIntento(true)
    if (Object.keys(errores).length > 0) return

    setEnviando(true)
    setError('')
    try {
      // 1) Guardar cómo quiere su ticket (solo si lo cambió)
      if (perfil && canal !== perfil.canalTicket) {
        await actualizarPerfilApi({ canalTicket: canal })
      }
      // 2) Crear el pedido: solo se mandan ids y cantidades; el total lo calcula el backend
      const pedido = await crearPedidoEnLinea({
        metodoPago: metodo,
        renglones: items.map((i) => ({ idProducto: i.idProducto, cantidad: i.cantidad })),
      })
      navigate('/cliente/pedido-confirmado', {
        replace: true,
        state: {
          pedido,
          canal,
          correo: perfil?.correo,
          telefono: perfil?.telefono,
          ultimos4: metodo === 'TARJETA' ? tarjeta.numero.slice(-4) : null,
        },
      })
      setConfirmado(true)
      vaciar() // el carrito se vacía una vez que el pedido quedó registrado
    } catch (err) {
      setError(err.mensajeUsuario) // ej. 422 si un producto se agotó mientras pagaba
      setEnviando(false)
    }
  }

  return (
    <form className={styles.pagina} onSubmit={pagar} noValidate>
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Pago</h1>
          <p className={styles.subtitulo}>Elige cómo pagar y confirma tu pedido.</p>
        </div>
        <PasosCompra actual={2} />
      </header>

      <Link to="/cliente/carrito" className={styles.regresar}>
        <ArrowLeft size={16} aria-hidden="true" /> Regresar al carrito
      </Link>

      {error && <p className={styles.errorGeneral} role="alert">{error}</p>}

      <div className={styles.columnas}>
        <div className={styles.columnaPrincipal}>
          <div className={styles.tarjeta}>
            <h2 className={styles.tarjetaTitulo} id="titulo-metodo">¿Cómo quieres pagar?</h2>
            <div className={styles.opciones} role="radiogroup" aria-labelledby="titulo-metodo">
              <label className={metodo === 'TARJETA' ? `${styles.opcion} ${styles.opcionActiva}` : styles.opcion}>
                <input type="radio" name="metodo" value="TARJETA" checked={metodo === 'TARJETA'} onChange={() => setMetodo('TARJETA')} />
                <CreditCard size={20} aria-hidden="true" />
                <span>
                  <strong>Pagar con tarjeta</strong>
                  <small>Débito o crédito.</small>
                </span>
              </label>
              <label className={metodo === 'EFECTIVO' ? `${styles.opcion} ${styles.opcionActiva}` : styles.opcion}>
                <input type="radio" name="metodo" value="EFECTIVO" checked={metodo === 'EFECTIVO'} onChange={() => setMetodo('EFECTIVO')} />
                <Store size={20} aria-hidden="true" />
                <span>
                  <strong>Pagar al recoger</strong>
                  <small>En sucursal: efectivo o tarjeta.</small>
                </span>
              </label>
            </div>
          </div>

          {metodo === 'TARJETA' && (
            <div className={styles.tarjeta}>
              <h2 className={styles.tarjetaTitulo}>Datos de la tarjeta</h2>
              <Campo etiqueta="Número de tarjeta" icono={CreditCard} error={errorDe('numero')}>
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1234 5678 9012 3456"
                  value={agruparNumero(tarjeta.numero)}
                  onChange={(e) => cambiar('numero', soloDigitos(e.target.value, 16))}
                />
              </Campo>
              <div className={styles.filaCampos}>
                <Campo etiqueta="Nombre en la tarjeta" icono={User} error={errorDe('nombre')}>
                  <input autoComplete="off" value={tarjeta.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
                </Campo>
                <Campo etiqueta="Vencimiento" icono={Calendar} error={errorDe('vencimiento')}>
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="MM/AA"
                    value={tarjeta.vencimiento}
                    onChange={(e) => cambiar('vencimiento', formatearVencimiento(e.target.value))}
                  />
                </Campo>
                <Campo etiqueta="CVV" icono={Lock} error={errorDe('cvv')}>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={tarjeta.cvv}
                    onChange={(e) => cambiar('cvv', soloDigitos(e.target.value, 4))}
                  />
                </Campo>
              </div>
              <p className={styles.seguro}>
                <ShieldCheck size={16} aria-hidden="true" /> Pago simulado: Pizza Code no guarda los datos de tu tarjeta.
              </p>
            </div>
          )}

          <div className={styles.tarjeta}>
            <h2 className={styles.tarjetaTitulo}>Recoges en</h2>
            <div className={styles.sucursal}>
              <span className={styles.sucursalIcono}><Store size={18} aria-hidden="true" /></span>
              <span>
                <strong>Pizza Code – Sucursal Centro</strong>
                <small>Av. Juárez 123, Col. Centro · Abierto hasta las 11:00 p. m.</small>
              </span>
            </div>
          </div>
        </div>

        <aside className={styles.tarjeta}>
          <h2 className={styles.tarjetaTitulo}>Tu pedido</h2>
          <ul className={styles.resumen}>
            {items.map((i) => (
              <li key={i.idProducto}>
                <span>{i.cantidad} × {i.nombre}</span>
                <span>{formatearMoneda(precioDe(i) * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          {descuento > 0 && (
            <>
              <div className={styles.fila}>
                <span>Subtotal</span>
                <span>{formatearMoneda(subtotal)}</span>
              </div>
              <div className={`${styles.fila} ${styles.filaDescuento}`}>
                <span>Descuento por promociones</span>
                <span>−{formatearMoneda(descuento)}</span>
              </div>
            </>
          )}
          <div className={styles.total}>
            <span>Total</span>
            <span>{formatearMoneda(total)}</span>
          </div>

          <fieldset className={styles.canal}>
            <legend>¿Cómo quieres recibir tu ticket?</legend>
            {CANALES.map((c) => (
              <label key={c.valor} className={styles.canalOpcion}>
                <input type="radio" name="canal" value={c.valor} checked={canal === c.valor} onChange={() => setCanal(c.valor)} />
                {c.texto}
              </label>
            ))}
          </fieldset>

          <BotonPrimario cargando={enviando} textoCargando="Procesando...">
            {metodo === 'TARJETA' ? `Pagar ${formatearMoneda(total)}` : 'Confirmar pedido'}
          </BotonPrimario>
        </aside>
      </div>
    </form>
  )
}

export default PagoPage
