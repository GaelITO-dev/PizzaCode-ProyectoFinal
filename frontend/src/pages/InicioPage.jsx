import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function InicioPage() {
  const { usuario, logout } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Hola, {usuario.nombre}</h1>
      <p>{usuario.correo} · {usuario.rol}</p>
      <button type="button" onClick={logout}>Cerrar sesión</button>
    </main>
  )
}

export default InicioPage