const NOMBRES = {
  SUCURSAL: 'Sucursal',
  EN_LINEA: 'En línea',
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
}

function celda(valor) {
  const texto = String(valor ?? '')
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

// Genera el CSV en el navegador y lo descarga (el BOM hace que Excel lea bien los acentos)
export function descargarReporteCsv(reporte) {
  const filas = [
    ['Reporte de ganancias', `${reporte.desde} a ${reporte.hasta}`],
    [],
    ['Ventas', reporte.ventas],
    ['Pedidos', reporte.pedidos],
    ['Ticket promedio', reporte.ticketPromedio],
    ['Cancelados', reporte.cancelados],
    ['Monto cancelado', reporte.montoCancelado],
    [],
    [reporte.agrupacion === 'HORA' ? 'Hora' : 'Día', 'Pedidos', 'Ventas'],
    ...reporte.serie.map((p) => [p.clave, p.pedidos, p.total]),
    [],
    ['Origen', 'Pedidos', 'Ventas'],
    ...reporte.porOrigen.map((g) => [NOMBRES[g.clave] ?? g.clave, g.pedidos, g.total]),
    [],
    ['Método de pago', 'Pedidos', 'Ventas'],
    ...reporte.porMetodoPago.map((g) => [NOMBRES[g.clave] ?? g.clave, g.pedidos, g.total]),
    [],
    ['Producto', 'Unidades', 'Ingresos'],
    ...reporte.masVendidos.map((p) => [p.nombre, p.unidades, p.ingresos]),
  ]

  const csv = '﻿' + filas.map((fila) => fila.map(celda).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))

  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `ganancias_${reporte.desde}_${reporte.hasta}.csv`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
