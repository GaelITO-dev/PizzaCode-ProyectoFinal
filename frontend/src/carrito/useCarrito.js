import { useState } from 'react'
import { useAuth } from '../auth/useAuth'

// El carrito vive en el navegador (localStorage), uno por usuario.
// Así no se pierde al recargar y otro usuario en la misma compu no ve el carrito ajeno.
const PREFIJO = 'pizzacode_carrito_'
const MAXIMO_POR_PRODUCTO = 20

function leer(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? []
  } catch {
    return []
  }
}

// Para el logout: borra los carritos guardados en este navegador
export function vaciarCarritosGuardados() {
  Object.keys(localStorage)
    .filter((clave) => clave.startsWith(PREFIJO))
    .forEach((clave) => localStorage.removeItem(clave))
}

export function useCarrito() {
  const { usuario } = useAuth()
  const clave = PREFIJO + (usuario?.correo ?? 'sin-sesion')
  const [items, setItems] = useState(() => leer(clave))

  function guardar(nuevos) {
    setItems(nuevos)
    localStorage.setItem(clave, JSON.stringify(nuevos))
  }

  // Si el producto ya está, solo suma la cantidad
  function agregar(producto, cantidad = 1) {
    const existente = items.find((i) => i.idProducto === producto.idProducto)
    if (existente) {
      guardar(
        items.map((i) =>
          i.idProducto === producto.idProducto
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, MAXIMO_POR_PRODUCTO) }
            : i
        )
      )
    } else {
      const { idProducto, nombre, precio, imagen } = producto
      guardar([...items, { idProducto, nombre, precio: Number(precio), imagen, cantidad }])
    }
  }

  function cambiarCantidad(idProducto, cantidad) {
    if (cantidad < 1) return quitar(idProducto)
    guardar(
      items.map((i) =>
        i.idProducto === idProducto ? { ...i, cantidad: Math.min(cantidad, MAXIMO_POR_PRODUCTO) } : i
      )
    )
  }

  function quitar(idProducto) {
    guardar(items.filter((i) => i.idProducto !== idProducto))
  }

  function vaciar() {
    setItems([])
    localStorage.removeItem(clave)
  }

  const totalPiezas = items.reduce((suma, i) => suma + i.cantidad, 0)
  const subtotal = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)

  return { items, agregar, cambiarCantidad, quitar, vaciar, totalPiezas, subtotal, maximo: MAXIMO_POR_PRODUCTO }
}
