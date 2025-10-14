import React from 'react';
import './index.css';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1A1A2E', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Son1kVerse
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Democratización Musical con IA
        </p>
        <div style={{ marginTop: '2rem' }}>
          <button style={{
            background: '#66FF66',
            color: '#1A1A2E',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
