import React from 'react';

// Versión ultra simplificada para identificar el problema
function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1A1A2E',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        padding: '40px',
        backgroundColor: '#16213E',
        borderRadius: '20px',
        border: '2px solid #00FFE7',
        boxShadow: '0 0 30px rgba(0, 255, 231, 0.3)'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#00FFE7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          fontSize: '40px',
          color: '#1A1A2E'
        }}>
          🌌
        </div>
        
        <h1 style={{
          fontSize: '48px',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #00FFE7, #B84DFF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Son1kVerse
        </h1>
        
        <p style={{
          fontSize: '24px',
          marginBottom: '40px',
          color: '#B84DFF'
        }}>
          Democratización Musical Global con IA
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#0A0C10',
            borderRadius: '15px',
            border: '1px solid #333344',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>🎵</div>
            <h3 style={{ color: '#00FFE7', marginBottom: '10px' }}>Generador Musical</h3>
            <p style={{ fontSize: '14px', color: '#888' }}>Crea música con IA</p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#0A0C10',
            borderRadius: '15px',
            border: '1px solid #333344',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>🎭</div>
            <h3 style={{ color: '#00FFE7', marginBottom: '10px' }}>Ghost Studio</h3>
            <p style={{ fontSize: '14px', color: '#888' }}>Democratización musical</p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#0A0C10',
            borderRadius: '15px',
            border: '1px solid #333344',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>🚀</div>
            <h3 style={{ color: '#00FFE7', marginBottom: '10px' }}>Nova Post Pilot</h3>
            <p style={{ fontSize: '14px', color: '#888' }}>Marketing digital</p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#0A0C10',
            borderRadius: '15px',
            border: '1px solid #333344',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>🤖</div>
            <h3 style={{ color: '#00FFE7', marginBottom: '10px' }}>Pixel IA</h3>
            <p style={{ fontSize: '14px', color: '#888' }}>Asistente inteligente</p>
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#0A0C10',
          borderRadius: '15px',
          border: '2px solid #00FFE7',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#00FFE7', marginBottom: '15px' }}>✅ Sistema Funcionando</h2>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            La aplicación está cargando correctamente
          </p>
          <p style={{ fontSize: '16px', color: '#B84DFF' }}>
            React + Vite + TypeScript funcionando perfectamente
          </p>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#1A1A2E',
          borderRadius: '10px',
          border: '1px solid #B84DFF'
        }}>
          <p style={{ color: '#B84DFF', fontSize: '14px', margin: 0 }}>
            🎯 Versión Ultra Simplificada - Sin Dependencias Complejas
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
