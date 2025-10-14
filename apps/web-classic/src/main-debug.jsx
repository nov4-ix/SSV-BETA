import React from 'react';
import ReactDOM from 'react-dom/client';

// Debug version - vamos a ver qué está pasando
function DebugApp() {
  const [debugInfo, setDebugInfo] = React.useState('Iniciando...');

  React.useEffect(() => {
    console.log('DebugApp mounted');
    setDebugInfo('Componente montado correctamente');
    
    // Verificar si hay errores
    const originalError = console.error;
    console.error = (...args) => {
      setDebugInfo(`Error detectado: ${args.join(' ')}`);
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1A1A2E',
      color: 'white',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ color: '#00FFE7', marginBottom: '20px' }}>🔍 Debug Mode</h1>
      
      <div style={{
        backgroundColor: '#0A0C10',
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid #00FFE7',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#B84DFF', marginBottom: '15px' }}>Estado del Sistema:</h2>
        <p><strong>React Version:</strong> {React.version}</p>
        <p><strong>Debug Info:</strong> {debugInfo}</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        <p><strong>URL:</strong> {window.location.href}</p>
      </div>

      <div style={{
        backgroundColor: '#0A0C10',
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid #B84DFF'
      }}>
        <h2 style={{ color: '#B84DFF', marginBottom: '15px' }}>Test de Funcionalidad:</h2>
        <button 
          onClick={() => setDebugInfo('Botón clickeado - React funciona!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#00FFE7',
            color: '#1A1A2E',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Click
        </button>
        <button 
          onClick={() => {
            try {
              throw new Error('Test error');
            } catch (e) {
              setDebugInfo(`Error capturado: ${e.message}`);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff1744',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Error
        </button>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#16213E',
        borderRadius: '10px',
        border: '1px solid #333344'
      }}>
        <h3 style={{ color: '#00FFE7', marginBottom: '10px' }}>Instrucciones:</h3>
        <p>1. Abre las herramientas de desarrollador (F12)</p>
        <p>2. Ve a la pestaña "Console"</p>
        <p>3. Busca errores en rojo</p>
        <p>4. Comparte cualquier error que veas</p>
      </div>
    </div>
  );
}

// Renderizar con error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
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
            <h1 style={{ color: '#ff1744', marginBottom: '20px' }}>❌ Error Boundary Activado</h1>
            <p style={{ marginBottom: '15px' }}>Se ha capturado un error:</p>
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

// Renderizar la aplicación
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DebugApp />
    </ErrorBoundary>
  </React.StrictMode>
);
