const FORMATO_MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function formatearMoneda(valor) {
  return FORMATO_MXN.format(Number(valor) || 0)
}
