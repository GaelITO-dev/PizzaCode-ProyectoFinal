function primeraLetra(texto) {
  return (texto ?? '').trim().charAt(0).toUpperCase()
}

export function obtenerIniciales(nombre, apellido) {
  if (apellido?.trim()) {
    return `${primeraLetra(nombre)}${primeraLetra(apellido)}` || '?'
  }

  const palabras = (nombre ?? '').trim().split(/\s+/).filter(Boolean)
  if (palabras.length === 0) return '?'

  return palabras
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('')
}