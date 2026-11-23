import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import BotonPrimario from '../../components/ui/BotonPrimario'
import CampoTexto from '../../components/ui/CampoTexto'
import Interruptor from '../../components/ui/Interruptor'
import campo from '../../components/ui/CampoTexto.module.css'
import { crearProducto, actualizarProducto } from '../../api/productosApi'
import styles from './ProductoFormulario.module.css'

// Mismas reglas que ProductoRequestDTO en el backend
function validar(datos) {
  const errores = {}
  const nombre = datos.nombre.trim()
  if (!nombre) errores.nombre = 'El nombre es obligatorio'
  else if (nombre.length > 100) errores.nombre = 'El nombre no debe superar los 100 caracteres'

  if (datos.descripcion.length > 255) errores.descripcion = 'La descripción no debe superar los 255 caracteres'

  if (datos.precio === '') errores.precio = 'El precio es obligatorio'
  else if (!/^\d{1,8}(\.\d{1,2})?$/.test(datos.precio)) errores.precio = 'Usa un precio válido, con máximo 2 decimales'
  else if (Number(datos.precio) < 0.01) errores.precio = 'El precio debe ser mayor a 0'

  if (!datos.idCategoria) errores.idCategoria = 'La categoría es obligatoria'

  if (datos.imagen.length > 255) errores.imagen = 'La URL no debe superar los 255 caracteres'
  return errores
}

// Si recibe "producto" es edición; si no, es alta
function ProductoFormulario({ producto, categorias, onCerrar, onGuardado }) {
  const [datos, setDatos] = useState({
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio: producto ? String(producto.precio) : '',
    idCategoria: producto ? String(producto.idCategoria) : '',
    imagen: producto?.imagen ?? '',
    disponible: producto?.disponible ?? true,
  })
  const [tocados, setTocados] = useState({})
  const [erroresServidor, setErroresServidor] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  const errores = validar(datos)

  // El error aparece en cuanto el usuario toca el campo (tiempo real) o al intentar guardar
  function errorDe(nombreCampo) {
    return (tocados[nombreCampo] && errores[nombreCampo]) || erroresServidor[nombreCampo]
  }

  function cambiar(nombreCampo, valor) {
    setDatos({ ...datos, [nombreCampo]: valor })
    setTocados({ ...tocados, [nombreCampo]: true })
    setErroresServidor({ ...erroresServidor, [nombreCampo]: undefined })
  }

  async function guardar(e) {
    e.preventDefault()
    setTocados({ nombre: true, descripcion: true, precio: true, idCategoria: true, imagen: true })
    if (Object.keys(errores).length > 0) return

    const cuerpo = {
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim() || null,
      precio: Number(datos.precio),
      idCategoria: Number(datos.idCategoria),
      imagen: datos.imagen.trim() || null,
      disponible: datos.disponible,
    }

    setGuardando(true)
    setErrorGeneral('')
    try {
      if (producto) {
        await actualizarProducto(producto.idProducto, cuerpo)
      } else {
        await crearProducto(cuerpo)
      }
      onGuardado()
    } catch (err) {
      // 400: errores por campo del backend; 422: mensaje general (ej. categoría inexistente)
      setErroresServidor(err.response?.data?.errors ?? {})
      setErrorGeneral(err.mensajeUsuario)
      setGuardando(false)
    }
  }

  return (
    <Modal abierto titulo={producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={onCerrar}>
      <form className={styles.formulario} onSubmit={guardar} noValidate>
        {errorGeneral && <p className={styles.errorGeneral} role="alert">{errorGeneral}</p>}

        <CampoTexto
          etiqueta="Nombre"
          placeholder="Ej. Pizza de pepperoni"
          value={datos.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          error={errorDe('nombre')}
        />

        <div className={campo.campo}>
          <label htmlFor="producto-descripcion" className={campo.etiqueta}>Descripción</label>
          <div className={`${campo.control} ${errorDe('descripcion') ? campo.conError : ''}`}>
            <textarea
              id="producto-descripcion"
              className={`${campo.input} ${styles.textarea}`}
              placeholder="Ej. Mediana · 8 rebanadas"
              value={datos.descripcion}
              onChange={(e) => cambiar('descripcion', e.target.value)}
            />
          </div>
          {errorDe('descripcion') && <p className={campo.error}>{errorDe('descripcion')}</p>}
        </div>

        <div className={styles.fila}>
          <CampoTexto
            etiqueta="Precio"
            tipo="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={datos.precio}
            onChange={(e) => cambiar('precio', e.target.value)}
            error={errorDe('precio')}
          />

          <div className={campo.campo}>
            <label htmlFor="producto-categoria" className={campo.etiqueta}>Categoría</label>
            <div className={`${campo.control} ${errorDe('idCategoria') ? campo.conError : ''}`}>
              <select
                id="producto-categoria"
                className={`${campo.input} ${styles.select}`}
                value={datos.idCategoria}
                onChange={(e) => cambiar('idCategoria', e.target.value)}
              >
                <option value="">Selecciona…</option>
                {categorias.map((c) => (
                  <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                ))}
              </select>
            </div>
            {errorDe('idCategoria') && <p className={campo.error}>{errorDe('idCategoria')}</p>}
          </div>
        </div>

        <CampoTexto
          etiqueta="URL de la imagen (opcional)"
          placeholder="https://…"
          value={datos.imagen}
          onChange={(e) => cambiar('imagen', e.target.value)}
          error={errorDe('imagen')}
        />

        <Interruptor
          activo={datos.disponible}
          etiqueta={datos.disponible ? 'Disponible en el menú' : 'No disponible'}
          onCambiar={(valor) => cambiar('disponible', valor)}
        />

        <div className={styles.acciones}>
          <button type="button" className={styles.botonSecundario} onClick={onCerrar}>
            Cancelar
          </button>
          <BotonPrimario cargando={guardando} textoCargando="Guardando...">
            {producto ? 'Guardar cambios' : 'Crear producto'}
          </BotonPrimario>
        </div>
      </form>
    </Modal>
  )
}

export default ProductoFormulario
