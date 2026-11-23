import styles from './Paginacion.module.css'

const MAXIMO_BOTONES = 5

// Paginación numerada: "Mostrando 1–6 de 17" y los botones 1, 2, 3...
function Paginacion({ pagina, totalPaginas, totalElementos, tamano, onCambiar }) {
  const desde = totalElementos === 0 ? 0 : pagina * tamano + 1
  const hasta = Math.min((pagina + 1) * tamano, totalElementos)

  // Si hay muchas páginas, solo se muestran 5 alrededor de la actual
  const inicio = Math.max(0, Math.min(pagina - 2, totalPaginas - MAXIMO_BOTONES))
  const numeros = Array.from({ length: Math.min(totalPaginas, MAXIMO_BOTONES) }, (_, i) => inicio + i)

  return (
    <div className={styles.paginacion}>
      <span>
        Mostrando {desde}–{hasta} de {totalElementos}
      </span>
      {totalPaginas > 1 && (
        <div className={styles.numeros}>
          {numeros.map((n) => (
            <button
              key={n}
              type="button"
              className={n === pagina ? `${styles.numero} ${styles.activo}` : styles.numero}
              aria-current={n === pagina ? 'page' : undefined}
              onClick={() => onCambiar(n)}
            >
              {n + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Paginacion
