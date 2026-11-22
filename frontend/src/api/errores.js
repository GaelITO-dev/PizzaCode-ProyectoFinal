export function obtenerMensajeError(error) {
  if (error.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder. Intenta de nuevo.'
  }

  if (!error.response) {
    return 'No hay conexión con el servidor. Revisa tu internet.'
  }

  const { status, data } = error.response

  if ([502, 503, 504].includes(status)) {
    return 'El servidor no está disponible en este momento. Intenta más tarde.'
  }

  if (data?.message) {
    return data.message
  }

  if (status >= 500) {
    return 'Ocurrió un error en el servidor. Intenta más tarde.'
  }

  return 'Ocurrió un error inesperado.'
}