const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_MAYUSCULA = /[A-ZÁÉÍÓÚÜÑ]/
const REGEX_NUMERO = /\d/
const REGEX_ESPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?¿¡]/
const REGEX_TELEFONO_PERMITIDO = /^[\d\s-]+$/

export function limpiarTelefono(telefono) {
  return telefono.replace(/[\s-]/g, '')
}

export function requisitosContrasena(contrasena) {
  return {
    longitud: contrasena.length >= 8 && contrasena.length <= 72,
    mayuscula: REGEX_MAYUSCULA.test(contrasena),
    numero: REGEX_NUMERO.test(contrasena),
    especial: REGEX_ESPECIAL.test(contrasena),
  }
}

function validarCorreo(correo) {
  const valor = correo.trim()
  if (!valor) return 'El correo es obligatorio'
  if (valor.length > 100) return 'El correo no debe superar los 100 caracteres'
  if (!REGEX_CORREO.test(valor)) return 'El correo no tiene un formato válido'
  return null
}

function validarTextoObligatorio(valor, campo) {
  const limpio = valor.trim()
  if (!limpio) return `El ${campo} es obligatorio`
  if (limpio.length < 2 || limpio.length > 50) {
    return `El ${campo} debe tener entre 2 y 50 caracteres`
  }
  return null
}

function validarTelefono(telefono) {
  if (!telefono.trim()) return 'El teléfono es obligatorio'
  if (!REGEX_TELEFONO_PERMITIDO.test(telefono)) return 'El teléfono solo puede contener números'
  const digitos = limpiarTelefono(telefono)
  if (digitos.length < 10 || digitos.length > 15) {
    return 'El teléfono debe contener entre 10 y 15 dígitos'
  }
  return null
}

function validarApellidoMat(apellidoMat) {
  return apellidoMat.trim().length > 50
    ? 'El apellido materno no debe superar los 50 caracteres'
    : null
}

function validarContrasena(contrasena) {
  if (!contrasena) return 'La contraseña es obligatoria'
  const requisitos = requisitosContrasena(contrasena)
  const cumpleTodo = Object.values(requisitos).every(Boolean)
  if (!cumpleTodo) {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial'
  }
  return null
}

function sinNulos(errores) {
  return Object.fromEntries(
    Object.entries(errores).filter(([, mensaje]) => mensaje !== null),
  )
}

export function validarLogin({ correo, contrasena }) {
  return sinNulos({
    correo: validarCorreo(correo),
    contrasena: contrasena ? null : 'La contraseña es obligatoria',
  })
}

export function validarRegistro(datos) {
  return sinNulos({
    nombre: validarTextoObligatorio(datos.nombre, 'nombre'),
    apellidoPat: validarTextoObligatorio(datos.apellidoPat, 'apellido paterno'),
    apellidoMat: validarApellidoMat(datos.apellidoMat),
    correo: validarCorreo(datos.correo),
    telefono: validarTelefono(datos.telefono),
    contrasena: validarContrasena(datos.contrasena),
    confirmarContrasena: !datos.confirmarContrasena
      ? 'Confirma tu contraseña'
      : datos.confirmarContrasena !== datos.contrasena
        ? 'Las contraseñas no coinciden'
        : null,
    aceptaTerminos: datos.aceptaTerminos
      ? null
      : 'Debes aceptar los términos y el aviso de privacidad',
  })
}

export function validarNombrePerfil(datos) {
  return sinNulos({
    nombre: validarTextoObligatorio(datos.nombre, 'nombre'),
    apellidoPat: validarTextoObligatorio(datos.apellidoPat, 'apellido paterno'),
    apellidoMat: validarApellidoMat(datos.apellidoMat),
  })
}

export function validarTelefonoPerfil(telefono) {
  return sinNulos({
    telefono: validarTelefono(telefono),
  })
}

export function validarCambioContrasena(datos) {
  const errorNueva = validarContrasena(datos.contrasenaNueva)

  return sinNulos({
    contrasenaActual: datos.contrasenaActual ? null : 'La contraseña actual es obligatoria',
    contrasenaNueva: errorNueva
      ?? (datos.contrasenaNueva === datos.contrasenaActual
        ? 'La nueva contraseña debe ser diferente a la actual'
        : null),
    confirmarContrasena: !datos.confirmarContrasena
      ? 'Confirma tu nueva contraseña'
      : datos.confirmarContrasena !== datos.contrasenaNueva
        ? 'Las contraseñas no coinciden'
        : null,
  })
}