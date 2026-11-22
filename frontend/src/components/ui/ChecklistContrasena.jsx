import { Circle, CircleCheck } from 'lucide-react'
import { requisitosContrasena } from '../../utils/validaciones'
import styles from './ChecklistContrasena.module.css'

const REQUISITOS = [
  { clave: 'longitud', texto: '8 o más caracteres' },
  { clave: 'mayuscula', texto: 'Una mayúscula' },
  { clave: 'numero', texto: 'Un número' },
  { clave: 'especial', texto: 'Un carácter especial' },
]

function ChecklistContrasena({ contrasena }) {
  const cumplidos = requisitosContrasena(contrasena)

  return (
    <ul className={styles.lista} aria-label="Requisitos de la contraseña">
      {REQUISITOS.map(({ clave, texto }) => {
        const cumplido = cumplidos[clave]
        const Icono = cumplido ? CircleCheck : Circle

        return (
          <li
            key={clave}
            className={cumplido ? `${styles.item} ${styles.cumplido}` : styles.item}
          >
            <Icono size={16} aria-hidden="true" />
            {texto}
            <span className={styles.soloLectores}>
              {cumplido ? ' (cumplido)' : ' (pendiente)'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default ChecklistContrasena