import { Component } from 'react'
import styles from './LimiteErrores.module.css'

// ErrorBoundary: atrapa errores al dibujar una pantalla para que no quede en blanco.
// Tiene que ser una clase: React solo ofrece getDerivedStateFromError y componentDidCatch en clases.
class LimiteErrores extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Error al mostrar la pantalla:', error, info.componentStack)
  }

  componentDidUpdate(propsAnteriores) {
    // Si el usuario navega a otra sección, se vuelve a intentar
    if (this.state.error && propsAnteriores.ubicacion !== this.props.ubicacion) {
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className={styles.contenedor} role="alert">
        <h2 className={styles.titulo}>Algo salió mal</h2>
        <p className={styles.texto}>Esta pantalla tuvo un problema. Puedes intentar de nuevo o ir a otra sección.</p>
        <button type="button" className={styles.boton} onClick={() => this.setState({ error: null })}>
          Intentar de nuevo
        </button>
      </div>
    )
  }
}

export default LimiteErrores
