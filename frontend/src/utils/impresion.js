const CLASE_IMPRESION = 'imprimiendo-ticket'

// Muestra solo el ticket (TicketCocina) al imprimir y lo vuelve a ocultar al cerrar el diálogo
export function imprimirTicket() {
  function limpiar() {
    document.body.classList.remove(CLASE_IMPRESION)
    window.removeEventListener('afterprint', limpiar)
  }

  window.addEventListener('afterprint', limpiar)
  document.body.classList.add(CLASE_IMPRESION)
  window.print()
}
