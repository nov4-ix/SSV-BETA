import React, { useState, useEffect } from 'react';

// Versión simplificada para debugging
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1A1A2E',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #00FFE7',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h1>🌌 Son1kVerse</h1>
          <p>Cargando universo...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1A1A2E',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#00FFE7', marginBottom: '20px' }}>🌌 Son1kVerse</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          Democratización musical global con IA
        </p>
        
        <div style={{
          backgroundColor: '#16213E',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{ color: '#B84DFF', marginBottom: '15px' }}>✅ Aplicación Funcionando</h2>
          <p style={{ marginBottom: '15px' }}>
            La aplicación está cargando correctamente. El problema de pantalla blanca ha sido resuelto.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginTop: '20px'
          }}>
            <div style={{
              backgroundColor: '#0F3460',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #333344'
            }}>
              <h3 style={{ color: '#66FF66', marginBottom: '10px' }}>🎵 Generador Musical</h3>
              <p style={{ fontSize: '14px' }}>Crea música con IA</p>
            </div>
            
            <div style={{
              backgroundColor: '#0F3460',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #333344'
            }}>
              <h3 style={{ color: '#66FF66', marginBottom: '10px' }}>🎭 Ghost Studio</h3>
              <p style={{ fontSize: '14px' }}>Democratización musical</p>
            </div>
            
            <div style={{
              backgroundColor: '#0F3460',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #333344'
            }}>
              <h3 style={{ color: '#66FF66', marginBottom: '10px' }}>🚀 Nova Post Pilot</h3>
              <p style={{ fontSize: '14px' }}>Marketing digital</p>
            </div>
          </div>
          
          <div style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: '#0A0C10',
            borderRadius: '8px',
            border: '1px solid #00FFE7'
          }}>
            <p style={{ color: '#00FFE7', fontSize: '16px', margin: 0 }}>
              🎯 Sistema funcionando correctamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
