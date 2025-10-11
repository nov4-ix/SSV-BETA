/**
 * 🌐 DETECTOR DE SUBDOMINIOS DE SON1KVERSE
 * 
 * Detecta el subdominio y redirige a la herramienta correspondiente
 */

import React, { useEffect, useState } from 'react';
import { Son1kverseMain } from './Son1kverseMain';
import LandingPage from './LandingPage';

interface SubdomainDetectorProps {
  userId?: string;
  sessionId?: string;
}

export function SubdomainDetector({ userId, sessionId }: SubdomainDetectorProps) {
  const [detectedTool, setDetectedTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectSubdomain = () => {
      const hostname = window.location.hostname;
      
      // Detectar subdominios
      if (hostname.includes('ghost-studio.son1kvers3.com')) {
        setDetectedTool('ghost-studio');
      } else if (hostname.includes('nova-post-pilot.son1kvers3.com')) {
        setDetectedTool('nova-post');
      } else if (hostname.includes('sanctuary.son1kvers3.com')) {
        setDetectedTool('sanctuary');
      } else if (hostname.includes('the-generator.son1kvers3.com')) {
        setDetectedTool('the-generator');
      } else if (hostname.includes('pixel.son1kvers3.com')) {
        setDetectedTool('pixel');
      } else if (hostname.includes('suno.son1kvers3.com')) {
        setDetectedTool('suno');
      } else if (hostname.includes('letras.son1kvers3.com')) {
        setDetectedTool('lyrics');
      } else if (hostname.includes('prompts.son1kvers3.com')) {
        setDetectedTool('prompts');
      } else if (hostname.includes('son1kvers3.com') || hostname.includes('www.son1kvers3.com')) {
        setDetectedTool('main');
      } else {
        setDetectedTool('main');
      }
      
      setIsLoading(false);
    };

    detectSubdomain();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">🌌 Son1kverse</h2>
          <p className="text-gray-400">Cargando universo...</p>
        </div>
      </div>
    );
  }

  // Si es el dominio principal, mostrar landing page
  if (detectedTool === 'main') {
    return <LandingPage userId={userId} sessionId={sessionId} />;
  }

  // Para subdominios específicos, mostrar la herramienta correspondiente
  return (
    <Son1kverseMain 
      userId={userId} 
      sessionId={sessionId} 
      initialTool={detectedTool as any}
    />
  );
}

export default SubdomainDetector;
