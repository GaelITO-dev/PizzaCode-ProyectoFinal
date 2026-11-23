// En la BD cada tamaño es un producto aparte: "Pepperoni mediana", "Pepperoni grande"...
// Si el nombre termina en una de estas palabras, se agrupa con los demás tamaños del mismo nombre.
// Así funciona también con los productos que el admin agregue después (ej. "Vegetariana chica").
const TAMANOS = ['chica', 'mediana', 'grande', 'familiar']

function ultimaPalabra(nombre) {
  const palabras = nombre.trim().split(/\s+/)
  return palabras[palabras.length - 1].toLowerCase()
}

// "Pepperoni grande" -> "grande"; "Coca-Cola 2L" -> null (no tiene tamaño)
export function tamanoDe(nombre) {
  const palabra = ultimaPalabra(nombre)
  return TAMANOS.includes(palabra) ? palabra : null
}

// "Pepperoni grande" -> "Pepperoni"; "Coca-Cola 2L" -> "Coca-Cola 2L"
export function nombreBase(nombre) {
  if (!tamanoDe(nombre)) return nombre.trim()
  return nombre.trim().split(/\s+/).slice(0, -1).join(' ')
}

// Ordena los tamaños de chico a grande para mostrarlos en ese orden
export function ordenarPorTamano(productos) {
  return [...productos].sort(
    (a, b) => TAMANOS.indexOf(tamanoDe(a.nombre)) - TAMANOS.indexOf(tamanoDe(b.nombre))
  )
}

// Junta los productos de la misma categoría y mismo nombre base en una sola tarjeta
export function agruparProductos(productos) {
  const grupos = []
  for (const producto of productos) {
    const base = nombreBase(producto.nombre)
    const grupo = grupos.find((g) => g.nombre === base && g.idCategoria === producto.idCategoria)
    if (grupo) {
      grupo.productos.push(producto)
    } else {
      grupos.push({ nombre: base, idCategoria: producto.idCategoria, productos: [producto] })
    }
  }
  return grupos.map((g) => ({
    ...g,
    disponible: g.productos.some((p) => p.disponible),
    imagen: g.productos.find((p) => p.imagen)?.imagen ?? null,
  }))
}

// "Pepperoni grande" -> "Grande" (para los botones de tamaño)
export function etiquetaTamano(nombre) {
  const tamano = tamanoDe(nombre)
  return tamano ? tamano.charAt(0).toUpperCase() + tamano.slice(1) : null
}
