// src/components/ColorPaletteManager.jsx
import React, { useState, useEffect } from 'react';

// ────────────────────────────────────────────────────────────────────────────────
// ADMINISTRADOR DE PALETA DE COLORES
// ────────────────────────────────────────────────────────────────────────────────

function ColorPaletteManager({ isOpen, onClose, onPaletteChange }) {
  const [palette, setPalette] = useState({
    bg: "#1A1A2E",
    panel: "#16213E", 
    card: "#0F3460",
    ink: "#333344",
    text: "#FFFFFF",
    muted: "#888888",
    neon: "#66FF66",
    pink: "#ff1744",
    gold: "#ffd700",
    purple: "#9c27b0",
    cyan: "#00bcd4",
    status: {
      online: "#4caf50",
      offline: "#f44336"
    }
  });

  const [presets, setPresets] = useState([
    {
      name: "Son1kvers3 Original",
      colors: {
        bg: "#1A1A2E",
        panel: "#16213E",
        card: "#0F3460", 
        ink: "#333344",
        text: "#FFFFFF",
        muted: "#888888",
        neon: "#66FF66",
        pink: "#ff1744",
        gold: "#ffd700",
        purple: "#9c27b0",
        cyan: "#00bcd4",
        status: {
          online: "#4caf50",
          offline: "#f44336"
        }
      }
    },
    {
      name: "Dark Cyberpunk",
      colors: {
        bg: "#0a0a0a",
        panel: "#111111",
        card: "#1a1a1a",
        ink: "#333333",
        text: "#ffffff",
        muted: "#a0a0a0",
        neon: "#ff6b35",
        pink: "#ff1744",
        gold: "#ffd700",
        purple: "#9c27b0",
        cyan: "#00bcd4",
        status: {
          online: "#4caf50",
          offline: "#f44336"
        }
      }
    },
    {
      name: "Neon Purple",
      colors: {
        bg: "#1a0a2e",
        panel: "#16213e",
        card: "#0f3460",
        ink: "#4a148c",
        text: "#ffffff",
        muted: "#e1bee7",
        neon: "#e91e63",
        pink: "#ff1744",
        gold: "#ffd700",
        purple: "#9c27b0",
        cyan: "#00bcd4",
        status: {
          online: "#4caf50",
          offline: "#f44336"
        }
      }
    },
    {
      name: "Ocean Blue",
      colors: {
        bg: "#0a1929",
        panel: "#132f4c",
        card: "#1e4976",
        ink: "#2d5a87",
        text: "#ffffff",
        muted: "#a8c8ec",
        neon: "#00bcd4",
        pink: "#ff1744",
        gold: "#ffd700",
        purple: "#9c27b0",
        cyan: "#00bcd4",
        status: {
          online: "#4caf50",
          offline: "#f44336"
        }
      }
    }
  ]);

  // Cargar paleta guardada
  useEffect(() => {
    const savedPalette = localStorage.getItem('son1kvers3_palette');
    if (savedPalette) {
      try {
        setPalette(JSON.parse(savedPalette));
      } catch (error) {
        console.error('Error loading saved palette:', error);
      }
    }
  }, []);

  // Guardar paleta
  const savePalette = () => {
    localStorage.setItem('son1kvers3_palette', JSON.stringify(palette));
    onPaletteChange(palette);
  };

  // Aplicar preset
  const applyPreset = (preset) => {
    setPalette(preset.colors);
    localStorage.setItem('son1kvers3_palette', JSON.stringify(preset.colors));
    onPaletteChange(preset.colors);
  };

  // Actualizar color
  const updateColor = (key, value, isStatus = false) => {
    if (isStatus) {
      setPalette(prev => ({
        ...prev,
        status: {
          ...prev.status,
          [key]: value
        }
      }));
    } else {
      setPalette(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Resetear a valores por defecto
  const resetPalette = () => {
    const defaultPalette = presets[0].colors;
    setPalette(defaultPalette);
    localStorage.setItem('son1kvers3_palette', JSON.stringify(defaultPalette));
    onPaletteChange(defaultPalette);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: palette.card,
        border: `1px solid ${palette.ink}`,
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: `1px solid ${palette.ink}`,
          paddingBottom: '16px'
        }}>
          <h2 style={{ color: palette.text, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            🎨 Administrador de Colores
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: palette.muted,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Presets */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: palette.text, fontSize: '18px', marginBottom: '12px' }}>
            Presets Disponibles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${palette.ink}`,
                  background: palette.panel,
                  color: palette.text,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = palette.neon;
                  e.target.style.boxShadow = `0 0 10px ${palette.neon}30`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = palette.ink;
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{preset.name}</div>
                <div style={{ fontSize: '12px', color: palette.muted }}>
                  {Object.keys(preset.colors).length} colores
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor de Colores */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: palette.text, fontSize: '18px', marginBottom: '12px' }}>
            Editor Personalizado
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {/* Colores principales */}
            {Object.entries(palette).filter(([key]) => key !== 'status').map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ 
                  color: palette.text, 
                  fontSize: '14px', 
                  fontWeight: '500',
                  minWidth: '80px',
                  textTransform: 'capitalize'
                }}>
                  {key}:
                </label>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: palette.panel,
                    border: `1px solid ${palette.ink}`,
                    borderRadius: '6px',
                    color: palette.text,
                    fontSize: '14px'
                  }}
                />
              </div>
            ))}

            {/* Colores de estado */}
            {Object.entries(palette.status).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ 
                  color: palette.text, 
                  fontSize: '14px', 
                  fontWeight: '500',
                  minWidth: '80px',
                  textTransform: 'capitalize'
                }}>
                  {key}:
                </label>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value, true)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value, true)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: palette.panel,
                    border: `1px solid ${palette.ink}`,
                    borderRadius: '6px',
                    color: palette.text,
                    fontSize: '14px'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: palette.text, fontSize: '18px', marginBottom: '12px' }}>
            Vista Previa
          </h3>
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${palette.ink}`,
            background: palette.bg
          }}>
            <div style={{
              padding: '12px',
              borderRadius: '6px',
              background: palette.card,
              marginBottom: '12px',
              border: `1px solid ${palette.ink}`
            }}>
              <div style={{ color: palette.text, fontWeight: 'bold', marginBottom: '8px' }}>
                Texto Principal
              </div>
              <div style={{ color: palette.muted, fontSize: '14px' }}>
                Texto secundario con color muted
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: palette.neon,
                color: palette.bg,
                border: 'none',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Botón Neon
              </button>
              <button style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'transparent',
                color: palette.cyan,
                border: `1px solid ${palette.cyan}`,
                fontSize: '14px'
              }}>
                Botón Cyan
              </button>
              <button style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'transparent',
                color: palette.purple,
                border: `1px solid ${palette.purple}`,
                fontSize: '14px'
              }}>
                Botón Purple
              </button>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          borderTop: `1px solid ${palette.ink}`,
          paddingTop: '16px'
        }}>
          <button
            onClick={resetPalette}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              background: 'transparent',
              color: palette.muted,
              border: `1px solid ${palette.ink}`,
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Resetear
          </button>
          <button
            onClick={savePalette}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              background: palette.neon,
              color: palette.bg,
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default ColorPaletteManager;
