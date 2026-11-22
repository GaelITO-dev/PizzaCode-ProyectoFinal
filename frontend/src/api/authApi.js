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