import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo salió mal</h2>
          <p>{this.state.error?.message || 'Error inesperado'}</p>
          <button onClick={() => window.location.reload()} className="btn">
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
