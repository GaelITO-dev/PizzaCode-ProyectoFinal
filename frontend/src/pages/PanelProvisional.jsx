import { useAuth } from '../auth/useAuth'

function PanelProvisional({ titulo }) {
  const { usuario, logout } = useAuth()

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{titulo}</h1>
      <p>
        {usuario.nombre} · {usuario.correo} · {usuario.rol}
      </p>
      <button type="button" onClick={logout}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default PanelProvisional