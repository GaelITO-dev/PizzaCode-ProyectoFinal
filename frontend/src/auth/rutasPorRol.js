export const RUTA_INICIO_POR_ROL = {
  ADMIN: '/admin',
  CAJERO: '/cajero',
  CLIENTE: '/cliente',
}

export function rutaInicio(rol) {
  return RUTA_INICIO_POR_ROL[rol] ?? '/login'
}
export function destinoTrasLogin(desde, rol) {
  const inicio = rutaInicio(rol)
  const perteneceAlRol = desde === inicio || desde?.startsWith(`${inicio}/`)
  return perteneceAlRol ? desde : inicio
}