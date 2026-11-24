const FORMATO_MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function formatearMoneda(valor) {
  return FORMATO_MXN.format(Number(valor) || 0)
}

const FORMATO_MXN_CORTO = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Sin centavos, para etiquetas pequeñas como las de la gráfica ($3,480)
export function formatearMonedaCorta(valor) {
  return FORMATO_MXN_CORTO.format(Number(valor) || 0)
}
