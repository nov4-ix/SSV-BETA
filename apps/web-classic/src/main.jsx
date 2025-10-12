import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Detectar si es dispositivo móvil
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Renderizar la app móvil si es dispositivo móvil
if (isMobile()) {
  // Importar dinámicamente la app móvil
  import('./MobileApp.jsx').then(({ default: MobileApp }) => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <MobileApp />
      </React.StrictMode>,
    )
  });
} else {
  // Renderizar la app desktop
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
}