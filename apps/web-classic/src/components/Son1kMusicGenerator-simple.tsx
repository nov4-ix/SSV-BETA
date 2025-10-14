// src/components/Son1kMusicGenerator.tsx

import React, { useState } from 'react';

interface Son1kMusicGeneratorProps {
  className?: string;
}

export default function Son1kMusicGenerator({ className = '' }: Son1kMusicGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Por favor ingresa un prompt');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulación de generación musical
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult({
        id: Date.now(),
        title: `Canción generada: ${prompt.substring(0, 30)}...`,
        prompt: prompt,
        status: 'completed',
        audioUrl: '#',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generando música:', error);
      alert('Error al generar música');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`son1k-music-generator ${className}`} style={{
      padding: '20px',
      backgroundColor: '#1A1A2E',
      color: 'white',
      borderRadius: '10px',
      border: '1px solid #333344'
    }}>
      <h2 style={{ color: '#00FFE7', marginBottom: '20px' }}>🎵 Generador Musical</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', color: '#B84DFF' }}>
          Prompt para la música:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Una canción épica de rock progresivo con sintetizadores vintage..."
          style={{
            width: '100%',
            height: '100px',
            padding: '10px',
            backgroundColor: '#0A0C10',
            color: 'white',
            border: '1px solid #333344',
            borderRadius: '8px',
            resize: 'vertical'
          }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isGenerating ? '#666' : '#00FFE7',
          color: '#0A0C10',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {isGenerating ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #0A0C10',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Generando música...
          </div>
        ) : (
          '🎵 Generar Música'
        )}
      </button>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#0A0C10',
          borderRadius: '8px',
          border: '1px solid #00FFE7'
        }}>
          <h3 style={{ color: '#00FFE7', marginBottom: '10px' }}>✅ Música Generada</h3>
          <p><strong>Título:</strong> {result.title}</p>
          <p><strong>Prompt:</strong> {result.prompt}</p>
          <p><strong>Estado:</strong> {result.status}</p>
          <p><strong>Creado:</strong> {new Date(result.createdAt).toLocaleString()}</p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
