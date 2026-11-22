export const RUTA_INICIO_POR_ROL = {
  ADMIN: '/admin',
  CAJERO: '/cajero',
  CLIENTE: '/cliente',
}

export function rutaInicio(rol) {
  return RUTA_INICIO_POR_ROL[rol] ?? '/login'
}
const RUTAS_COMUNES = ['/perfil']

export function destinoTrasLogin(desde, rol) {
  const inicio = rutaInicio(rol)
  const perteneceAlRol = desde === inicio || desde?.startsWith(`${inicio}/`)
  const esComun = RUTAS_COMUNES.includes(desde)
  return perteneceAlRol || esComun ? desde : inicio
}