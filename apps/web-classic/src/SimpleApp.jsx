import React from 'react';

function SimpleApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #00FFE7, #B84DFF, #FFD700)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Son1kVerse
        </h1>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#9AF7EE',
          marginBottom: '2rem'
        }}>
          Super Son1k Universe
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: '#888888',
          marginBottom: '2rem'
        }}>
          Democratización musical global con IA
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(45deg, #00FFE7, #B84DFF)',
            border: 'none',
            borderRadius: '10px',
            color: '#000000',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}>
            Generar Música
          </button>
          <button style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(45deg, #B84DFF, #FFD700)',
            border: 'none',
            borderRadius: '10px',
            color: '#000000',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}>
            Ghost Studio
          </button>
        </div>
        <p style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#666666'
        }}>
          ✅ Aplicación funcionando correctamente
        </p>
      </div>
    </div>
  );
}

export default SimpleApp;
