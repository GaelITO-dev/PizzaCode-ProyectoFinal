import api from './axiosClient'

export async function listarUsuarios(params) {
  const { data } = await api.get('/usuarios', { params })
  return data
}

export async function obtenerResumenUsuarios() {
  const { data } = await api.get('/usuarios/resumen')
  return data
}

export async function bloquearUsuario(idUsuario, motivo) {
  const { data } = await api.patch(`/usuarios/${idUsuario}/bloqueo`, { motivo })
  return data
}

export async function desbloquearUsuario(idUsuario) {
  const { data } = await api.patch(`/usuarios/${idUsuario}/desbloqueo`)
  return data
}
