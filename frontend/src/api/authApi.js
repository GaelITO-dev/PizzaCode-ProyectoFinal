import api from './axiosClient'

export async function loginApi(correo, contrasena) {
  const { data } = await api.post('/auth/login', {
    correo: correo.trim(),
    contrasena,
  })
  return data
}

export async function registrarApi(datos) {
  const { data } = await api.post('/auth/registro', datos)
  return data
}

export async function logoutApi() {
  await api.post('/auth/logout')
}

export async function solicitarRecuperacionApi(correo) {
  const { data } = await api.post('/auth/recuperar', { correo: correo.trim() })
  return data
}

export async function restablecerContrasenaApi(token, nuevaContrasena) {
  const { data } = await api.post('/auth/restablecer', { token, nuevaContrasena })
  return data
}