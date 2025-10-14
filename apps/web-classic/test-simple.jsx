import React from 'react'
import ReactDOM from 'react-dom/client'

// Test simple para verificar que React funciona
function TestApp() {
  return React.createElement('div', { 
    style: { 
      padding: '20px', 
      backgroundColor: '#1A1A2E', 
      color: 'white', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    } 
  }, '✅ React está funcionando correctamente!')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(TestApp)
)
