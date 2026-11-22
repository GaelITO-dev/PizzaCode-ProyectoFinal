const USUARIO_KEY = 'pizzacode_usuario'

export const usuarioStorage = {
  get: () => {
    const guardado = localStorage.getItem(USUARIO_KEY)
    if (!guardado) return null
    try {
      return JSON.parse(guardado)
    } catch {
      return null
    }
  },
  set: (usuario) => localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario)),
  remove: () => localStorage.removeItem(USUARIO_KEY),
}