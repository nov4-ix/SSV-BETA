// src/MobileApp.jsx
import React, { useState, useEffect } from 'react';
import './MobileApp.css';

// ────────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN MÓVIL
// ────────────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1';

// ────────────────────────────────────────────────────────────────────────────────────────────────
// PALETA DE COLORES SON1KVERS3 MÓVIL
// ────────────────────────────────────────────────────────────────────────────────────────────────
const palette = {
  bg: '#0a0a0a',
  surface: '#111111',
  card: '#1a1a1a',
  border: '#333333',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#ff6b35',
  purple: '#9c27b0',
  neon: '#00ff88',
  gold: '#ffd700'
};

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTES MÓVILES
// ────────────────────────────────────────────────────────────────────────────────

function MobileCard({ children, className = '', ...props }) {
  return (
    <div 
      className={`mobile-card ${className}`}
      style={{
        background: palette.card,
        border: `1px solid ${palette.border}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function MobileButton({ children, variant = 'primary', onClick, className = '', ...props }) {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.purple} 100%)`,
      color: 'white',
      border: 'none'
    },
    secondary: {
      background: 'transparent',
      color: palette.text,
      border: `1px solid ${palette.border}`
    },
    neon: {
      background: palette.neon,
      color: palette.bg,
      border: 'none'
    },
    gold: {
      background: palette.gold,
      color: palette.bg,
      border: 'none'
    }
  };

  return (
    <button
      className={`mobile-button ${className}`}
      style={{
        ...variants[variant],
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '44px', // Touch-friendly
        ...props.style
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function MobileInput({ label, type = 'text', value, onChange, placeholder, className = '', ...props }) {
  return (
    <div className={`mobile-input-group ${className}`} style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          color: palette.textSecondary, 
          fontSize: '14px', 
          marginBottom: '6px',
          fontWeight: '500'
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: '8px',
          color: palette.text,
          fontSize: '16px',
          minHeight: '44px', // Touch-friendly
          boxSizing: 'border-box'
        }}
        {...props}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// MODAL DE AUTENTICACIÓN MÓVIL
// ────────────────────────────────────────────────────────────────────────────────
function MobileAuthModal({ isOpen, onClose, mode, onModeChange }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        // Simular login - verificar si es cuenta ALVAE
        console.log('Mobile Login:', formData.email);
        
        let userData = {
          email: formData.email,
          username: formData.email.split('@')[0],
          tier: 'FREE',
          alvaeSymbol: ''
        };
        
        // Verificar si es cuenta ALVAE
        if (formData.email === 'nov4-ix@son1kvers3.com') {
          userData = {
            email: formData.email,
            username: 'Nov4-ix',
            tier: 'ALVAE_FOUNDER',
            alvaeSymbol: '◯⚡'
          };
        } else if (formData.email.startsWith('pro.tester') && formData.email.endsWith('@son1kvers3.com')) {
          const testerNumber = formData.email.match(/pro\.tester(\d+)@son1kvers3\.com/)?.[1] || '1';
          userData = {
            email: formData.email,
            username: `Tester${testerNumber}`,
            tier: 'ALVAE_TESTER',
            alvaeSymbol: '◯⚡'
          };
        }
        
        localStorage.setItem('son1kvers3_user', JSON.stringify(userData));
        onClose();
      } else {
        // Simular registro
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        console.log('Mobile Register:', formData);
        localStorage.setItem('son1kvers3_user', JSON.stringify({
          email: formData.email,
          username: formData.username,
          tier: 'FREE',
          alvaeSymbol: ''
        }));
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
      <MobileCard style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: palette.text, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: palette.textSecondary,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <MobileInput
              label="Nombre de usuario"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Tu nombre de usuario"
              required
            />
          )}

          <MobileInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="tu@email.com"
            required
          />

          <MobileInput
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="••••••••"
            required
          />

          {mode === 'register' && (
            <MobileInput
              label="Confirmar contraseña"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="••••••••"
              required
            />
          )}

          {error && (
            <div style={{ color: '#ff4444', fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <MobileButton
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {isLoading ? 'Procesando...' : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </MobileButton>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: palette.accent,
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {mode === 'login' 
              ? '¿No tienes cuenta? Regístrate' 
              : '¿Ya tienes cuenta? Inicia sesión'
            }
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: palette.textSecondary }}>
          Al continuar, aceptas nuestros{' '}
          <a href="#" style={{ color: palette.accent }}>Términos de Servicio</a>
          {' '}y{' '}
          <a href="#" style={{ color: palette.accent }}>Política de Privacidad</a>
        </div>
      </MobileCard>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// HEADER MÓVIL
// ────────────────────────────────────────────────────────────────────────────────
function MobileHeader({ user, onLogin, onLogout }) {
  return (
    <header style={{
      background: `linear-gradient(180deg, ${palette.surface} 0%, ${palette.bg} 100%)`,
      borderBottom: `1px solid ${palette.border}`,
      padding: '12px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: palette.card,
            border: `1px solid ${palette.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: palette.neon
          }}>
            SV
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: palette.text }}>
            SON1KVERS3
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <div style={{ fontSize: '12px', color: palette.textSecondary }}>
                <span style={{ color: palette.gold, fontWeight: 'bold' }}>
                  {user.alvaeSymbol || ''}
                </span>
                {user.username}
              </div>
              <MobileButton
                variant="secondary"
                onClick={onLogout}
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                Salir
              </MobileButton>
            </>
          ) : (
            <MobileButton
              variant="primary"
              onClick={() => onLogin('login')}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              Entrar
            </MobileButton>
          )}
        </div>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// HERO MÓVIL
// ────────────────────────────────────────────────────────────────────────────────
function MobileHero() {
  return (
    <section style={{ padding: '24px 16px' }}>
      <MobileCard>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: palette.textSecondary, marginBottom: '8px' }}>
            LA RESISTENCIA
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            lineHeight: '1.2',
            marginBottom: '16px',
            color: palette.text
          }}>
            <span>Lo imperfecto </span>
            <span style={{ 
              background: `linear-gradient(90deg, #fff 0%, ${palette.accent} 45%, ${palette.purple} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              también
            </span>
            <span> es sagrado</span>
          </h1>
          <p style={{ color: palette.textSecondary, fontSize: '16px', marginBottom: '20px' }}>
            Componer con alma en un mundo de máquinas.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <MobileButton variant="primary" style={{ width: '100%' }}>
              🎵 Entrar al Estudio
            </MobileButton>
            <MobileButton variant="secondary" style={{ width: '100%' }}>
              📚 Codex Maestro
            </MobileButton>
          </div>
        </div>
      </MobileCard>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// HERRAMIENTAS MÓVILES
// ────────────────────────────────────────────────────────────────────────────────
function MobileTools() {
  const tools = [
    { name: 'Ghost Studio', icon: '👻', color: palette.purple, url: 'https://ghost-studio.son1kvers3.com' },
    { name: 'The Generator', icon: '🎵', color: palette.accent, url: 'https://the-generator.son1kvers3.com' },
    { name: 'Santuario', icon: '🏛️', color: '#00bcd4', url: '#santuario' },
    { name: 'Nov4-Post-Pilot', icon: '🚀', color: '#e91e63', url: 'https://nov4-post-pilot.son1kvers3.com' },
    { name: 'Planes', icon: '💎', color: palette.gold, url: '#planes' }
  ];

  return (
    <section style={{ padding: '0 16px 24px' }}>
      <h2 style={{ color: palette.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        🎛️ Herramientas
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {tools.map((tool, index) => (
          <MobileCard
            key={index}
            onClick={() => window.open(tool.url, '_blank')}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              padding: '16px 12px',
              background: `linear-gradient(135deg, ${tool.color}20 0%, ${tool.color}10 100%)`,
              border: `1px solid ${tool.color}40`,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {tool.icon}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: palette.text }}>
              {tool.name}
            </div>
          </MobileCard>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// TOP 10 MÓVIL
// ────────────────────────────────────────────────────────────────────────────────
function MobileTop10() {
  const topGenerations = [
    { rank: 1, title: "Midnight Dreams", artist: "Pixel_User_001", plays: 2847 },
    { rank: 2, title: "Echoes of Tomorrow", artist: "Ghost_Studio_Pro", plays: 2156 },
    { rank: 3, title: "Neon Streets", artist: "Suno_Master", plays: 1983 },
    { rank: 4, title: "Digital Love", artist: "AI_Composer", plays: 1765 },
    { rank: 5, title: "Quantum Beats", artist: "Pixel_User_042", plays: 1543 }
  ];

  return (
    <section style={{ padding: '0 16px 24px' }}>
      <h2 style={{ color: palette.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        🏆 Top 5 Generaciones
      </h2>
      
      <MobileCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topGenerations.map((track, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: palette.surface,
                borderRadius: '8px',
                border: `1px solid ${palette.border}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: index < 3 
                    ? `linear-gradient(135deg, ${palette.accent} 0%, ${palette.purple} 100%)`
                    : palette.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {track.rank}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: palette.text }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: '12px', color: palette.textSecondary }}>
                    por {track.artist}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: palette.accent }}>
                  {track.plays.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: palette.textSecondary }}>
                  plays
                </div>
              </div>
            </div>
          ))}
        </div>
      </MobileCard>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// PLANES MÓVILES
// ────────────────────────────────────────────────────────────────────────────────
function MobilePlans() {
  const plans = [
    {
      name: "FREE",
      price: "Gratis",
      features: ["5 generaciones/mes", "Compartir con marca de agua", "Acceso básico"],
      color: palette.border
    },
    {
      name: "PRO",
      price: "$29",
      features: ["100 generaciones/mes", "Descargas", "Soporte prioritario"],
      color: palette.accent,
      popular: true
    },
    {
      name: "PREMIUM",
      price: "$79",
      features: ["150 generaciones/mes", "Sin marca de agua", "Soporte 24/7"],
      color: palette.purple,
      premium: true
    }
  ];

  return (
    <section style={{ padding: '0 16px 24px' }}>
      <h2 style={{ color: palette.text, fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        💎 Planes
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {plans.map((plan, index) => (
          <MobileCard
            key={index}
            style={{
              border: `2px solid ${plan.color}`,
              background: plan.popular || plan.premium 
                ? `linear-gradient(135deg, ${plan.color}20 0%, ${plan.color}10 100%)`
                : palette.card
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: palette.text, fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                {plan.name}
              </h3>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: plan.color }}>
                {plan.price}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              {plan.features.map((feature, i) => (
                <div key={i} style={{ fontSize: '14px', color: palette.textSecondary, marginBottom: '4px' }}>
                  ✓ {feature}
                </div>
              ))}
            </div>
            
            <MobileButton
              variant={plan.popular ? 'primary' : plan.premium ? 'gold' : 'secondary'}
              style={{ width: '100%' }}
            >
              {plan.name === 'FREE' ? 'Comenzar Gratis' : 'Suscribirse'}
            </MobileButton>
          </MobileCard>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// APP MÓVIL PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────────
export default function MobileApp() {
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  // Cargar usuario desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('son1kvers3_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('son1kvers3_user');
      }
    }
  }, []);

  const handleAuth = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleAuthClose = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
    const savedUser = localStorage.getItem('son1kvers3_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('son1kvers3_user');
    setUser(null);
  };

  const handleModeChange = (newMode) => {
    setAuthModal({ ...authModal, mode: newMode });
  };

  return (
    <div style={{
      background: palette.bg,
      color: palette.text,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <MobileHeader
        user={user}
        onLogin={handleAuth}
        onLogout={handleLogout}
      />
      
      <MobileHero />
      <MobileTools />
      <MobileTop10 />
      <MobilePlans />
      
      {/* Modal de autenticación */}
      <MobileAuthModal
        isOpen={authModal.isOpen}
        onClose={handleAuthClose}
        mode={authModal.mode}
        onModeChange={handleModeChange}
      />
    </div>
  );
}
