import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'
import PanelProvisional from './pages/PanelProvisional'
import NoAutorizadoPage from './pages/NoAutorizadoPage'
import RutaProtegida from './auth/RutaProtegida'
import RedireccionInicio from './auth/RedireccionInicio'

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      {/* Cualquier usuario autenticado */}
      <Route element={<RutaProtegida />}>
        <Route path="/" element={<RedireccionInicio />} />
        <Route path="/no-autorizado" element={<NoAutorizadoPage />} />
      </Route>

      {/* Solo CLIENTE */}
      <Route element={<RutaProtegida rolesPermitidos={['CLIENTE']} />}>
        <Route path="/cliente" element={<PanelProvisional titulo="Panel del cliente" />} />
      </Route>

      {/* Solo CAJERO */}
      <Route element={<RutaProtegida rolesPermitidos={['CAJERO']} />}>
        <Route path="/cajero" element={<PanelProvisional titulo="Panel del cajero" />} />
      </Route>

      {/* Solo ADMIN */}
      <Route element={<RutaProtegida rolesPermitidos={['ADMIN']} />}>
        <Route path="/admin" element={<PanelProvisional titulo="Panel del administrador" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App