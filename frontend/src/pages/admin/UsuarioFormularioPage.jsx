import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Lock, Mail, Phone, ShieldCheck, Store, User } from 'lucide-react'
import { crearEmpleado, editarUsuario, obtenerUsuario } from '../../api/usuariosApi'
import { useAuth } from '../../auth/useAuth'
import Avatar from '../../components/ui/Avatar'
import CampoTexto from '../../components/ui/CampoTexto'
import ChecklistContrasena from '../../components/ui/ChecklistContrasena'
import { NOMBRE_ROL } from '../../components/layout/navegacion'
import { limpiarTelefono, validarFormularioUsuario } from '../../utils/validaciones'
import styles from './UsuarioFormularioPage.module.css'

const VACIO = {
  nombre: '',
  apellidoPat: '',
  apellidoMat: '',
  correo: '',
  telefono: '',
  contrasena: '',
  rol: 'CAJERO',
}

const ROLES = [
  {
    valor: 'CAJERO',
    texto: 'Cajero',
    descripcion: 'Registra pedidos en sucursal, imprime tickets y cambia estados.',
    icono: Store,
  },
  {
    valor: 'ADMIN',
    texto: 'Administrador',
    descripcion: 'Acceso total: productos, promociones, usuarios y reportes.',
    icono: ShieldCheck,
  },
]

const CLASE_ROL = {
  ADMIN: styles.rolAdmin,
  CAJERO: styles.rolCajero,
  CLIENTE: styles.rolCliente,
}

function UsuarioFormularioPage() {
  const { id } = useParams()
  const esNuevo = id === undefined
  const navigate = useNavigate()
  const { usuario: actual, actualizarUsuario } = useAuth()

  const [datos, setDatos] = useState(VACIO)
  const [original, setOriginal] = useState(null)
  const [cargando, setCargando] = useState(!esNuevo)
  const [errorCarga, setErrorCarga] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Al editar, se cargan los datos actuales del usuario
  useEffect(() => {
    if (esNuevo) return

    let vigente = true

    obtenerUsuario(id)
      .then((u) => {
        if (!vigente) return
        setOriginal(u)
        setDatos({
          nombre: u.nombre,
          apellidoPat: u.apellidoPat,
          apellidoMat: u.apellidoMat ?? '',
          correo: u.correo,
          telefono: u.telefono ?? '',
          contrasena: '',
          rol: u.rol.nombre,
        })
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
  }, [id, esNuevo])

  const esEmpleado = esNuevo || (original !== null && original.rol.nombre !== 'CLIENTE')
  const esYo = !esNuevo && original?.idUsuario === actual?.idUsuario
  const puedeCambiarRol = esEmpleado && !esYo

  function cambiar(evento) {
    const { name, value } = evento.target
    setDatos((anteriores) => ({ ...anteriores, [name]: value }))
    setErrores((anteriores) => ({ ...anteriores, [name]: undefined }))
  }

  function mostrarErrorDelServidor(err) {
    const status = err.response?.status
    const delServidor = err.response?.data?.errors

    if (status === 409) {
      setErrores({ correo: err.response.data.message })
    } else if (delServidor && Object.keys(delServidor).length > 0) {
      setErrores(delServidor)
    } else {
      setErrorGeneral(err.mensajeUsuario)
    }
  }

  async function enviar(evento) {
    evento.preventDefault()

    const encontrados = validarFormularioUsuario(datos, { esNuevo })
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados)
      return
    }

    setGuardando(true)
    setErrorGeneral('')

    const comunes = {
      nombre: datos.nombre.trim(),
      apellidoPat: datos.apellidoPat.trim(),
      apellidoMat: datos.apellidoMat.trim(),
      telefono: limpiarTelefono(datos.telefono),
    }

    try {
      if (esNuevo) {
        await crearEmpleado({
          ...comunes,
          correo: datos.correo.trim(),
          contrasena: datos.contrasena,
          rol: datos.rol,
        })
        navigate('/admin/usuarios', { state: { aviso: 'Empleado creado correctamente.' } })
      } else {
        const cambios = { ...comunes }
        if (puedeCambiarRol && datos.rol !== original.rol.nombre) {
          cambios.rol = datos.rol
        }

        const actualizado = await editarUsuario(original.idUsuario, cambios)

        if (esYo) {
          actualizarUsuario({ nombre: actualizado.nombre, apellidoPat: actualizado.apellidoPat })
        }
        navigate('/admin/usuarios', { state: { aviso: 'Cambios guardados correctamente.' } })
      }
    } catch (err) {
      mostrarErrorDelServidor(err)
      setGuardando(false)
    }
  }

  if (cargando) {
    return <p className={styles.estado}>Cargando usuario…</p>
  }

  if (errorCarga) {
    return (
      <div className={styles.estado} role="alert">
        <p>{errorCarga}</p>
        <Link to="/admin/usuarios" className={styles.volver}>
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a usuarios
        </Link>
      </div>
    )
  }

  const nombreResumen = [datos.nombre, datos.apellidoPat, datos.apellidoMat]
    .map((texto) => texto.trim())
    .filter(Boolean)
    .join(' ')

  return (
    <section className={styles.pagina}>
      <Link to="/admin/usuarios" className={styles.volver}>
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a usuarios
      </Link>

      <header>
        <h1 className={styles.titulo}>{esNuevo ? 'Nuevo empleado' : 'Editar usuario'}</h1>
        <p className={styles.subtitulo}>
          {esNuevo ? 'Crea la cuenta de un cajero o administrador.' : 'Actualiza los datos de la cuenta.'}
        </p>
      </header>

      <form className={styles.cuadricula} onSubmit={enviar} noValidate>
        <div className={styles.columna}>
          <section className={styles.tarjeta} aria-labelledby="titulo-datos">
            <h2 id="titulo-datos" className={styles.tituloTarjeta}>Datos personales</h2>

            <div className={styles.campos}>
              <div className={styles.completo}>
                <CampoTexto
                  etiqueta="Nombre(s)"
                  name="nombre"
                  icono={User}
                  value={datos.nombre}
                  onChange={cambiar}
                  error={errores.nombre}
                  maxLength={50}
                  autoComplete="off"
                  autoFocus={esNuevo}
                />
              </div>
              <CampoTexto
                etiqueta="Apellido paterno"
                name="apellidoPat"
                icono={User}
                value={datos.apellidoPat}
                onChange={cambiar}
                error={errores.apellidoPat}
                maxLength={50}
                autoComplete="off"
              />
              <CampoTexto
                etiqueta="Apellido materno (opcional)"
                name="apellidoMat"
                icono={User}
                value={datos.apellidoMat}
                onChange={cambiar}
                error={errores.apellidoMat}
                maxLength={50}
                autoComplete="off"
              />
              <div>
                <CampoTexto
                  etiqueta="Correo"
                  tipo="email"
                  name="correo"
                  icono={Mail}
                  value={datos.correo}
                  onChange={cambiar}
                  error={errores.correo}
                  maxLength={100}
                  autoComplete="off"
                  readOnly={!esNuevo}
                />
                {!esNuevo && <p className={styles.ayuda}>El correo no se puede cambiar.</p>}
              </div>
              <CampoTexto
                etiqueta="Teléfono"
                tipo="tel"
                name="telefono"
                icono={Phone}
                value={datos.telefono}
                onChange={cambiar}
                error={errores.telefono}
                inputMode="numeric"
                maxLength={20}
                autoComplete="off"
              />
            </div>
          </section>

          {esEmpleado && (
            <section className={styles.tarjeta} aria-labelledby="titulo-rol">
              <h2 id="titulo-rol" className={styles.tituloTarjeta}>Rol</h2>
              {esYo && <p className={styles.ayuda}>No puedes cambiar tu propio rol.</p>}

              <fieldset className={styles.roles} disabled={!puedeCambiarRol} aria-labelledby="titulo-rol">
                {ROLES.map((rol) => {
                  const Icono = rol.icono
                  const activo = datos.rol === rol.valor
                  return (
                    <label
                      key={rol.valor}
                      className={activo ? `${styles.opcionRol} ${styles.opcionRolActiva}` : styles.opcionRol}
                    >
                      <input
                        type="radio"
                        name="rol"
                        value={rol.valor}
                        checked={activo}
                        onChange={cambiar}
                        className={styles.radio}
                      />
                      <span className={styles.iconoRol}>
                        <Icono size={18} aria-hidden="true" />
                      </span>
                      <span>
                        <span className={styles.tituloRol}>{rol.texto}</span>
                        <span className={styles.descripcionRol}>{rol.descripcion}</span>
                      </span>
                    </label>
                  )
                })}
              </fieldset>

              {errores.rol && <p className={styles.error}>{errores.rol}</p>}
            </section>
          )}

          {esNuevo && (
            <section className={styles.tarjeta} aria-labelledby="titulo-contrasena">
              <h2 id="titulo-contrasena" className={styles.tituloTarjeta}>Contraseña temporal</h2>
              <p className={styles.ayuda}>Compártela con el empleado; podrá cambiarla desde Mi perfil.</p>
              <CampoTexto
                etiqueta="Contraseña temporal"
                tipo="password"
                name="contrasena"
                icono={Lock}
                value={datos.contrasena}
                onChange={cambiar}
                error={errores.contrasena}
                maxLength={72}
                autoComplete="new-password"
              />
              <ChecklistContrasena contrasena={datos.contrasena} />
            </section>
          )}
        </div>

        <aside className={styles.resumen} aria-labelledby="titulo-resumen">
          <h2 id="titulo-resumen" className={styles.tituloTarjeta}>Resumen</h2>

          <div className={styles.tarjetaPersona}>
            <Avatar nombre={datos.nombre} apellido={datos.apellidoPat} />
            <div className={styles.persona}>
              <p className={styles.nombre}>{nombreResumen || 'Nombre del empleado'}</p>
              <p className={styles.correo}>{datos.correo.trim() || 'correo@pizzacode.mx'}</p>
            </div>
            <span className={`${styles.rol} ${CLASE_ROL[datos.rol] ?? ''}`}>
              {NOMBRE_ROL[datos.rol] ?? datos.rol}
            </span>
          </div>

          {errorGeneral && (
            <p className={styles.errorGeneral} role="alert">
              {errorGeneral}
            </p>
          )}

          <div className={styles.acciones}>
            <Link to="/admin/usuarios" className={styles.botonSecundario}>
              Cancelar
            </Link>
            <button type="submit" className={styles.botonPrimario} disabled={guardando}>
              <Check size={16} aria-hidden="true" />
              {guardando ? 'Guardando…' : esNuevo ? 'Crear empleado' : 'Guardar cambios'}
            </button>
          </div>
        </aside>
      </form>
    </section>
  )
}

export default UsuarioFormularioPage
