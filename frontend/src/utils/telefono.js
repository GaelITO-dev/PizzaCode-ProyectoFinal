export function formatearTelefono(telefono) {
  if (!telefono) return 'Sin registrar'
  if (/^\d{10}$/.test(telefono)) {
    return `${telefono.slice(0, 2)} ${telefono.slice(2, 6)} ${telefono.slice(6)}`
  }
  return telefono
}
