export const NOMBRE_ORIGEN = { SUCURSAL: 'Sucursal', EN_LINEA: 'En línea' }

export function fechaDeHoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function tituloDelDia() {
  const texto = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function formatearHora(fecha) {
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return ''
  return valor.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
}

export function resumenProductos(productos) {
  return (productos ?? []).map((r) => `${r.cantidad} × ${r.nombreProducto}`).join(', ')
}
