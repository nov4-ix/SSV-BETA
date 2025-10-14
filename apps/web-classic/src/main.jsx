import React from 'react'
import ReactDOM from 'react-dom/client'

// Importar App de forma segura
import App from './App.jsx'

// Error Boundary simple
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#1A1A2E',
          color: 'white',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#0A0C10',
            padding: '30px',
            borderRadius: '15px',
            border: '2px solid #ff1744',
            maxWidth: '600px'
          }}>
            <h1 style={{ color: '#ff1744', marginBottom: '20px' }}>❌ Error Detectado</h1>
            <p style={{ marginBottom: '15px' }}>Se ha producido un error:</p>
            <pre style={{
              backgroundColor: '#16213E',
              padding: '15px',
              borderRadius: '8px',
              color: '#ff1744',
              fontSize: '14px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#00FFE7',
                color: '#1A1A2E',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Renderizar la aplicación con Error Boundary
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)