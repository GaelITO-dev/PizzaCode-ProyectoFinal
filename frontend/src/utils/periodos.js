const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const PERIODOS = [
  { valor: 'DIA', texto: 'Día' },
  { valor: 'SEMANA', texto: 'Semana' },
  { valor: 'MES', texto: 'Mes' },
]

export const NOMBRE_PERIODO_ANTERIOR = {
  DIA: 'día anterior',
  SEMANA: 'semana anterior',
  MES: 'mes anterior',
}

function soloFecha(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Fecha local → "YYYY-MM-DD" (sin pasar por UTC, para que no cambie de día)
export function aISO(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

// "YYYY-MM-DD" → fecha local
export function desdeISO(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

// La semana va de lunes a domingo
function inicioDeSemana(fecha) {
  const inicio = soloFecha(fecha)
  const dia = inicio.getDay()
  inicio.setDate(inicio.getDate() + (dia === 0 ? -6 : 1 - dia))
  return inicio
}

export function rangoDelPeriodo(periodo, referencia) {
  const ref = soloFecha(referencia)
  if (periodo === 'DIA') {
    return { desde: ref, hasta: ref }
  }
  if (periodo === 'SEMANA') {
    const desde = inicioDeSemana(ref)
    const hasta = new Date(desde)
    hasta.setDate(desde.getDate() + 6)
    return { desde, hasta }
  }
  return {
    desde: new Date(ref.getFullYear(), ref.getMonth(), 1),
    hasta: new Date(ref.getFullYear(), ref.getMonth() + 1, 0),
  }
}

export function moverReferencia(periodo, referencia, pasos) {
  const nueva = soloFecha(referencia)
  if (periodo === 'DIA') {
    nueva.setDate(nueva.getDate() + pasos)
  } else if (periodo === 'SEMANA') {
    nueva.setDate(nueva.getDate() + 7 * pasos)
  } else {
    nueva.setDate(1)
    nueva.setMonth(nueva.getMonth() + pasos)
  }
  return nueva
}

// El periodo incluye hoy: no se puede avanzar más
export function incluyeHoy(hasta) {
  return hasta >= soloFecha(new Date())
}

export function etiquetaDelPeriodo(periodo, { desde, hasta }) {
  if (periodo === 'DIA') {
    return capitalizar(
      `${DIAS_LARGOS[desde.getDay()]} ${desde.getDate()} ${MESES_CORTOS[desde.getMonth()]} ${desde.getFullYear()}`,
    )
  }
  if (periodo === 'SEMANA') {
    const mesInicio = desde.getMonth() === hasta.getMonth() ? '' : ` ${MESES_CORTOS[desde.getMonth()]}`
    return `Semana del ${desde.getDate()}${mesInicio} al ${hasta.getDate()} ${MESES_CORTOS[hasta.getMonth()]} ${hasta.getFullYear()}`
  }
  return capitalizar(desde.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }))
}

// Etiqueta debajo de cada barra: "Lun 9", "14:00" o solo "9" si hay muchas barras
export function etiquetaDePunto(agrupacion, clave, compacta = false) {
  if (agrupacion === 'HORA') {
    return `${clave}:00`
  }
  const fecha = desdeISO(clave)
  return compacta ? String(fecha.getDate()) : `${DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()}`
}

// "el martes 10" o "las 14:00", para la nota del mejor punto
export function nombreDePunto(agrupacion, clave) {
  if (agrupacion === 'HORA') {
    return `las ${clave}:00`
  }
  const fecha = desdeISO(clave)
  return `el ${DIAS_LARGOS[fecha.getDay()]} ${fecha.getDate()}`
}
