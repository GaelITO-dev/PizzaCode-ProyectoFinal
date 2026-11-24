import { useEffect, useState } from 'react'
import { listarPromociones } from '../api/promocionesApi'

// Mismo cálculo que el backend (PedidoService.precioConDescuento): redondeo a 2 decimales
export function precioConDescuento(precio, descuento) {
  if (!descuento) return Number(precio)
  return Math.round(Number(precio) * (100 - Number(descuento))) / 100
}

// Descuentos vigentes por producto: { idProducto: mayor % de descuento }.
// Solo es para MOSTRAR el precio; el que cobra de verdad es el backend al crear el pedido.
export function useDescuentos() {
  const [descuentos, setDescuentos] = useState({})

  useEffect(() => {
    let vigente = true
    listarPromociones({ vigentes: true, size: 100 })
      .then((data) => {
        if (!vigente) return
        const mapa = {}
        for (const promo of data.content) {
          for (const id of promo.idsProductos) {
            mapa[id] = Math.max(mapa[id] ?? 0, Number(promo.descuento))
          }
        }
        setDescuentos(mapa)
      })
      .catch(() => {}) // si falla, se muestran precios normales
    return () => {
      vigente = false
    }
  }, [])

  const descuentoDe = (idProducto) => descuentos[idProducto] ?? 0
  const precioDe = (producto) => precioConDescuento(producto.precio, descuentoDe(producto.idProducto))

  // Totales del carrito: subtotal a precio normal, cuánto se ahorra y total a pagar
  function totales(items) {
    const subtotal = items.reduce((s, i) => s + Number(i.precio) * i.cantidad, 0)
    const total = items.reduce((s, i) => s + precioDe(i) * i.cantidad, 0)
    return { subtotal, descuento: subtotal - total, total }
  }

  return { descuentoDe, precioDe, totales }
}
