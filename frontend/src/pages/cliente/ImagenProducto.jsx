import { Pizza } from 'lucide-react'

// Imagen del producto o, si no tiene, un ícono de pizza del mismo tamaño
function ImagenProducto({ imagen, className, tamanoIcono = 24 }) {
  if (imagen) return <img src={imagen} alt="" className={className} />
  return (
    <span className={className} aria-hidden="true">
      <Pizza size={tamanoIcono} />
    </span>
  )
}

export default ImagenProducto
