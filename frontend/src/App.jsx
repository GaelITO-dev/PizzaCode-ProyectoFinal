import PromocionesPage from './pages/admin/PromocionesPage'
import PromocionFormularioPage from './pages/admin/PromocionFormularioPage'
import ComentariosPage from './pages/admin/ComentariosPage'
import ProductosPage from './pages/admin/ProductosPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'
import PanelProvisional from './pages/PanelProvisional'
import NoAutorizadoPage from './pages/NoAutorizadoPage'
import PerfilPage from './pages/perfil/PerfilPage'
import RutaProtegida from './auth/RutaProtegida'
import RedireccionInicio from './auth/RedireccionInicio'
import AppLayout from './components/layout/AppLayout'

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      {/* Requieren sesión */}
      <Route element={<RutaProtegida />}>
        <Route path="/" element={<RedireccionInicio />} />
        <Route path="/no-autorizado" element={<NoAutorizadoPage />} />

        {/* Parte interna: barra lateral + barra superior */}
        <Route element={<AppLayout />}>
          <Route path="/perfil" element={<PerfilPage />} />

          <Route element={<RutaProtegida rolesPermitidos={['CLIENTE']} />}>
            <Route path="/cliente" element={<PanelProvisional titulo="Inicio" />} />
            <Route path="/cliente/menu" element={<PanelProvisional titulo="Menú" />} />
            <Route path="/cliente/historial" element={<PanelProvisional titulo="Historial de pedidos" />} />
          </Route>

          <Route element={<RutaProtegida rolesPermitidos={['CAJERO']} />}>
            <Route path="/cajero" element={<PanelProvisional titulo="Nuevo pedido" />} />
            <Route path="/cajero/pedidos" element={<PanelProvisional titulo="Pedidos de hoy" />} />
            <Route path="/cajero/historial" element={<PanelProvisional titulo="Pedidos de la semana" />} />
            <Route path="/cajero/clientes" element={<PanelProvisional titulo="Buscar cliente" />} />
            <Route path="/cajero/clientes/:idUsuario" element={<PanelProvisional titulo="Historial del cliente" />} />
          </Route>

          <Route element={<RutaProtegida rolesPermitidos={['ADMIN']} />}>
            <Route path="/admin" element={<PanelProvisional titulo="Ganancias" />} />
            <Route path="/admin/pedidos" element={<PanelProvisional titulo="Todos los pedidos" />} />
            <Route path="/admin/productos" element={<ProductosPage />} />
            <Route path="/admin/usuarios" element={<PanelProvisional titulo="Usuarios" />} />
            <Route path="/admin/promociones" element={<PromocionesPage />} />
            <Route path="/admin/promociones/nueva" element={<PromocionFormularioPage />} />
            <Route path="/admin/promociones/:id/editar" element={<PromocionFormularioPage />} />
            <Route path="/admin/comentarios" element={<ComentariosPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App