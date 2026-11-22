import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { rutaInicio } from './rutasPorRol'

function RedireccionInicio() {
  const { usuario } = useAuth()
  return <Navigate to={rutaInicio(usuario.rol)} replace />
}

export default RedireccionInicio