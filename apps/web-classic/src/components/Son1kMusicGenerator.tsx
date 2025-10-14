// src/components/Son1kMusicGenerator.tsx

import React, { useState } from 'react';
import { useTieredTokenService } from '../hooks/useTieredTokenService';
import TierStatus from './TierStatus';

interface Son1kMusicGeneratorProps {
  className?: string;
}

export default function Son1kMusicGenerator({ className = '' }: Son1kMusicGeneratorProps) {
  const {
    isLoading,
    error,
    musicData,
    tokenStatus,
    hasValidToken,
    canGenerate,
    generateMusic,
    refreshToken,
    logout
  } = useTieredTokenService();

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('pop');
  const [title, setTitle] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [instrumental, setInstrumental] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [gender, setGender] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Por favor ingresa un prompt');
      return;
    }

    try {
      await generateMusic({
        prompt: prompt.trim(),
        style: style || 'pop',
        title: title.trim() || '',
        customMode,
        instrumental,
        lyrics: lyrics.trim() || '',
        gender: gender || ''
      });
    } catch (err) {
      console.error('Error generando música:', err);
    }
  };

  const handleQuickGenerate = async () => {
    if (!prompt.trim()) {
      alert('Por favor ingresa un prompt');
      return;
    }

    try {
      await quickGenerate(prompt.trim(), style);
    } catch (err) {
      console.error('Error en generación rápida:', err);
    }
  };

  const handleClear = () => {
    clearSongs();
    clearError();
    setPrompt('');
    setTitle('');
    setLyrics('');
  };

  const formatProgress = () => {
    if (loading) {
      return `Generando... ${progress}%`;
    }
    return '';
  };

  return (
    <div className={`son1k-music-generator ${className}`}>
      <div className="generator-header">
        <h2>🎵 Son1k Music Generator</h2>
        <div className={`backend-status ${hasValidToken ? 'healthy' : 'unhealthy'}`}>
          {hasValidToken ? '✅ Token Válido' : '❌ Token Inválido'}
        </div>
      </div>

      <TierStatus className="mb-4" />

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}

      <div className="generator-form">
        <div className="form-group">
          <label htmlFor="prompt">Prompt de la canción:</label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: happy pop song, rock ballad, electronic dance..."
            disabled={isLoading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="style">Estilo:</label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={isLoading}
            >
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="electronic">Electronic</option>
              <option value="jazz">Jazz</option>
              <option value="classical">Classical</option>
              <option value="hip-hop">Hip-Hop</option>
              <option value="country">Country</option>
              <option value="blues">Blues</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Género vocal:</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Automático</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title">Título (opcional):</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la canción"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lyrics">Letras (opcional):</label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Escribe las letras de la canción..."
            rows={4}
            disabled={isLoading}
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={customMode}
              onChange={(e) => setCustomMode(e.target.checked)}
              disabled={isLoading}
            />
            Modo personalizado
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={instrumental}
              onChange={(e) => setInstrumental(e.target.checked)}
              disabled={isLoading}
            />
            Solo instrumental
          </label>
        </div>

        <div className="form-actions">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !canGenerate}
            className="btn-primary"
          >
            {isLoading ? 'Generando...' : '🎵 Generar Música'}
          </button>

          <button
            onClick={handleQuickGenerate}
            disabled={isLoading || !canGenerate}
            className="btn-secondary"
          >
            ⚡ Generación Rápida
          </button>

          <button
            onClick={handleClear}
            disabled={isLoading}
            className="btn-clear"
          >
            🗑️ Limpiar
          </button>
        </div>

        {isLoading && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `50%` }}></div>
            <span className="progress-text">Generando música...</span>
          </div>
        )}
      </div>

      {musicData && musicData.songs && musicData.songs.length > 0 && (
        <div className="songs-results">
          <h3>🎶 Canciones Generadas ({musicData.songs.length})</h3>
          <div className="songs-grid">
            {musicData.songs.map((song: any, index: number) => {
              return (
                <div key={song.id} className="song-card">
                  <div className="song-image">
                    <img src={song.image_url} alt={song.title} />
                  </div>
                  <div className="song-info">
                    <h4>{song.title}</h4>
                    <p className="song-tags">
                      {song.tags}
                    </p>
                    <div className="song-actions">
                      <audio controls className="audio-player">
                        <source src={song.stream_audio_url || song.audio_url} type="audio/mpeg" />
                        Tu navegador no soporta audio.
                      </audio>
                      <a
                        href={song.stream_audio_url || song.audio_url}
                        download={`${song.title}.mp3`}
                        className="download-btn"
                      >
                        📥 Descargar
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
