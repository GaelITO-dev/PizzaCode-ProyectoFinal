import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import RutaProtegida from './auth/RutaProtegida'
import RedireccionInicio from './auth/RedireccionInicio'
import AppLayout from './components/layout/AppLayout'
import AvisoConexion from './components/layout/AvisoConexion'
import LimiteErrores from './components/layout/LimiteErrores'
import Cargando from './components/ui/Cargando'

// Cada pantalla se descarga la primera vez que se visita (code splitting).
// El login y el layout se cargan de inmediato porque se usan siempre.
const RegistroPage = lazy(() => import('./pages/auth/RegistroPage'))
const RecuperarPage = lazy(() => import('./pages/auth/RecuperarPage'))
const RestablecerPage = lazy(() => import('./pages/auth/RestablecerPage'))
const NoAutorizadoPage = lazy(() => import('./pages/NoAutorizadoPage'))
const PanelProvisional = lazy(() => import('./pages/PanelProvisional'))
const PerfilPage = lazy(() => import('./pages/perfil/PerfilPage'))

const InicioClientePage = lazy(() => import('./pages/cliente/InicioClientePage'))
const ProductoDetallePage = lazy(() => import('./pages/cliente/ProductoDetallePage'))
const CarritoPage = lazy(() => import('./pages/cliente/CarritoPage'))
const PagoPage = lazy(() => import('./pages/cliente/PagoPage'))
const PedidoConfirmadoPage = lazy(() => import('./pages/cliente/PedidoConfirmadoPage'))
const PedidoSeguimientoPage = lazy(() => import('./pages/cliente/PedidoSeguimientoPage'))
const MisPedidosPage = lazy(() => import('./pages/cliente/MisPedidosPage'))
const PromocionesClientePage = lazy(() => import('./pages/cliente/PromocionesClientePage'))

const PuntoVentaPage = lazy(() => import('./pages/cajero/PuntoVentaPage'))
const PedidosHoyPage = lazy(() => import('./pages/cajero/PedidosHoyPage'))
const HistorialDiaPage = lazy(() => import('./pages/cajero/HistorialDiaPage'))

const GananciasPage = lazy(() => import('./pages/admin/GananciasPage'))
const TodosPedidosPage = lazy(() => import('./pages/admin/TodosPedidosPage'))
const ProductosPage = lazy(() => import('./pages/admin/ProductosPage'))
const UsuariosPage = lazy(() => import('./pages/admin/UsuariosPage'))
const UsuarioFormularioPage = lazy(() => import('./pages/admin/UsuarioFormularioPage'))
const PromocionesPage = lazy(() => import('./pages/admin/PromocionesPage'))
const PromocionFormularioPage = lazy(() => import('./pages/admin/PromocionFormularioPage'))
const ComentariosPage = lazy(() => import('./pages/admin/ComentariosPage'))

function App() {
  const ubicacion = useLocation()

  return (
    <>
      <LimiteErrores ubicacion={ubicacion.pathname}>
        <Suspense fallback={<Cargando centrado />}>
          <Routes>
            {/* Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/recuperar" element={<RecuperarPage />} />
            <Route path="/restablecer" element={<RestablecerPage />} />

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
                  <Route path="/admin" element={<GananciasPage />} />
                  <Route path="/admin/pedidos" element={<TodosPedidosPage />} />
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
        </Suspense>
      </LimiteErrores>

      <AvisoConexion />
    </>
  )
}

export default App
