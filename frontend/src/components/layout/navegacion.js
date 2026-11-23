import {
  ClipboardList,
  History,
  House,
  LayoutDashboard,
  MessageSquare,
  Pizza,
  ShoppingCart,
  Tag,
  User,
  Users,
} from 'lucide-react'

export const NAVEGACION_POR_ROL = {
  CLIENTE: [
    { texto: 'Inicio', ruta: '/cliente', icono: House, exacta: true },
    { texto: 'Carrito', ruta: '/cliente/carrito', icono: ShoppingCart },
    { texto: 'Historial', ruta: '/cliente/historial', icono: History },
    { texto: 'Mi perfil', ruta: '/perfil', icono: User },
  ],
  CAJERO: [
    { texto: 'Inicio', ruta: '/cajero', icono: House, exacta: true },
    { texto: 'Pedidos de hoy', ruta: '/cajero/pedidos', icono: ClipboardList },
    { texto: 'Historial', ruta: '/cajero/historial', icono: History },
    { texto: 'Mi perfil', ruta: '/perfil', icono: User },
  ],
  ADMIN: [
    { texto: 'Panel', ruta: '/admin', icono: LayoutDashboard, exacta: true },
    { texto: 'Historial', ruta: '/admin/pedidos', icono: History },
    { texto: 'Menú', ruta: '/admin/productos', icono: Pizza },
    { texto: 'Usuarios', ruta: '/admin/usuarios', icono: Users },
    { texto: 'Promociones', ruta: '/admin/promociones', icono: Tag },
    { texto: 'Comentarios', ruta: '/admin/comentarios', icono: MessageSquare },
    { texto: 'Mi perfil', ruta: '/perfil', icono: User },
  ],
}

export const NOMBRE_ROL = {
  ADMIN: 'Administrador',
  CAJERO: 'Cajero',
  CLIENTE: 'Cliente',
}