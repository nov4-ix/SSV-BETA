import React from 'react'
import ReactDOM from 'react-dom/client'
import MobileApp from './MobileApp.jsx'
import './MobileApp.css'

// Detectar si es dispositivo móvil
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Renderizar la app móvil si es dispositivo móvil
if (isMobile()) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MobileApp />
    </React.StrictMode>,
  )
} else {
  // Redirigir a la versión desktop
  window.location.href = '/';
}
