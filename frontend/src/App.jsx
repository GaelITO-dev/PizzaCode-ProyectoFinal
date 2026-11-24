import PromocionesPage from './pages/admin/PromocionesPage'
import PromocionFormularioPage from './pages/admin/PromocionFormularioPage'
import ComentariosPage from './pages/admin/ComentariosPage'
import ProductosPage from './pages/admin/ProductosPage'
import UsuariosPage from './pages/admin/UsuariosPage'
import UsuarioFormularioPage from './pages/admin/UsuarioFormularioPage'
import PuntoVentaPage from './pages/cajero/PuntoVentaPage'
import InicioClientePage from './pages/cliente/InicioClientePage'
import ProductoDetallePage from './pages/cliente/ProductoDetallePage'
import CarritoPage from './pages/cliente/CarritoPage'
import PagoPage from './pages/cliente/PagoPage'
import PedidoConfirmadoPage from './pages/cliente/PedidoConfirmadoPage'
import PedidoSeguimientoPage from './pages/cliente/PedidoSeguimientoPage'
import MisPedidosPage from './pages/cliente/MisPedidosPage'
import PromocionesClientePage from './pages/cliente/PromocionesClientePage'
import PedidosHoyPage from './pages/cajero/PedidosHoyPage'
import HistorialDiaPage from './pages/cajero/HistorialDiaPage'
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
            <Route path="/cliente" element={<InicioClientePage />} />
            <Route path="/cliente/producto/:id" element={<ProductoDetallePage />} />
            <Route path="/cliente/carrito" element={<CarritoPage />} />
            <Route path="/cliente/pago" element={<PagoPage />} />
            <Route path="/cliente/pedido-confirmado" element={<PedidoConfirmadoPage />} />
            <Route path="/cliente/historial/:id" element={<PedidoSeguimientoPage />} />
            <Route path="/cliente/menu" element={<PanelProvisional titulo="Menú" />} />
            <Route path="/cliente/historial" element={<MisPedidosPage />} />
            <Route path="/cliente/promociones" element={<PromocionesClientePage />} />
          </Route>

          <Route element={<RutaProtegida rolesPermitidos={['CAJERO']} />}>
            <Route path="/cajero" element={<PuntoVentaPage />} />
            <Route path="/cajero/pedidos" element={<PedidosHoyPage />} />
            <Route path="/cajero/historial" element={<HistorialDiaPage />} />
          </Route>

          <Route element={<RutaProtegida rolesPermitidos={['ADMIN']} />}>
            <Route path="/admin" element={<PanelProvisional titulo="Ganancias" />} />
            <Route path="/admin/pedidos" element={<PanelProvisional titulo="Todos los pedidos" />} />
            <Route path="/admin/productos" element={<ProductosPage />} />
            <Route path="/admin/usuarios" element={<UsuariosPage />} />
            <Route path="/admin/usuarios/nuevo" element={<UsuarioFormularioPage key="nuevo" />} />
            <Route path="/admin/usuarios/:id/editar" element={<UsuarioFormularioPage key="editar" />} />
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