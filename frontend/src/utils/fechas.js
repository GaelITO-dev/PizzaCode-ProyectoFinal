const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Lee "2026-11-01" o "2026-11-01T18:30:00" sin que la zona horaria cambie el día
function partes(iso) {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return { anio, mes, dia }
}

const dosDigitos = (n) => String(n).padStart(2, '0')

// "01 nov"
export function fechaCorta(iso) {
  const { mes, dia } = partes(iso)
  return `${dosDigitos(dia)} ${MESES[mes - 1]}`
}

// "01 nov – 30 nov 2026"
export function rangoFechas(inicio, fin) {
  return `${fechaCorta(inicio)} – ${fechaCorta(fin)} ${partes(fin).anio}`
}

// "18/11/2026"
export function fechaNumerica(iso) {
  const { anio, mes, dia } = partes(iso)
  return `${dosDigitos(dia)}/${dosDigitos(mes)}/${anio}`
}

// "5:40 p. m."
export function hora(iso) {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
}
