import { useState } from 'react'
import { Check } from 'lucide-react'
import CampoTexto from '../../components/ui/CampoTexto'
import { validarNombrePerfil } from '../../utils/validaciones'
import styles from './PerfilPage.module.css'

function EditarNombre({ perfil, alGuardar, alCancelar }) {
  const [datos, setDatos] = useState({
    nombre: perfil.nombre ?? '',
    apellidoPat: perfil.apellidoPat ?? '',
    apellidoMat: perfil.apellidoMat ?? '',
  })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cambiar(evento) {
    const { name, value } = evento.target
    setDatos((actual) => ({ ...actual, [name]: value }))
    setErrores((actual) => ({ ...actual, [name]: undefined }))
  }

  async function enviar(evento) {
    evento.preventDefault()

    const encontrados = validarNombrePerfil(datos)
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      return
    }

    setGuardando(true)
    setErrorGeneral('')

    try {
      await alGuardar({
        nombre: datos.nombre.trim(),
        apellidoPat: datos.apellidoPat.trim(),
        apellidoMat: datos.apellidoMat.trim(),
      })
    } catch (err) {
      const delServidor = err.response?.data?.errors
      if (delServidor && Object.keys(delServidor).length > 0) {
        setErrores(delServidor)
      } else {
        setErrorGeneral(err.mensajeUsuario)
      }
      setGuardando(false)
    }
  }

  function alPresionarTecla(evento) {
    if (evento.key === 'Escape') alCancelar()
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} onKeyDown={alPresionarTecla} noValidate>
      <div className={styles.camposNombre}>
        <CampoTexto
          etiqueta="Nombre"
          name="nombre"
          value={datos.nombre}
          onChange={cambiar}
          error={errores.nombre}
          autoComplete="given-name"
          maxLength={50}
          autoFocus
        />
        <CampoTexto
          etiqueta="Apellido paterno"
          name="apellidoPat"
          value={datos.apellidoPat}
          onChange={cambiar}
          error={errores.apellidoPat}
          autoComplete="family-name"
          maxLength={50}
        />
        <CampoTexto
          etiqueta="Apellido materno (opcional)"
          name="apellidoMat"
          value={datos.apellidoMat}
          onChange={cambiar}
          error={errores.apellidoMat}
          autoComplete="additional-name"
          maxLength={50}
        />
      </div>

      {errorGeneral && (
        <p className={styles.errorGeneral} role="alert">
          {errorGeneral}
        </p>
      )}

      <div className={styles.acciones}>
        <button type="button" className={styles.botonSecundario} onClick={alCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className={styles.botonPrimario} disabled={guardando}>
          <Check size={16} aria-hidden="true" />
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default EditarNombre
