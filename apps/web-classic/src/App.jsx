import React, { useState, useEffect } from 'react';
import SubdomainDetector from './components/SubdomainDetector';
import Son1kverseMain from './components/Son1kverseMain';
import Son1kMusicGenerator from './components/Son1kMusicGenerator';
import { Son1kVerseTest } from './components/Son1kVerseTest';
import './components/Son1kMusicGenerator.css';
import './App.css';

// ────────────────────────────────────────────────────────────────────────────────
// CONFIG API
// ────────────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta?.env?.VITE_API_BASE || "https://68edd79f78d7cef650777246--son1k.netlify.app/.netlify/functions";

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────────

function App() {
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [user, setUser] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [enter, setEnter] = useState(false);
  const [nexusClicks, setNexusClicks] = useState(0);
  const [nexusMode, setNexusMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // ────────────────────────────────────────────────────────────────────────────────
  // EFECTOS Y FUNCIONES
  // ────────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Generar IDs únicos
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setUserId(newUserId);
    setSessionId(newSessionId);

    // Verificar estado del backend
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      setBackendOnline(response.ok);
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendOnline(false);
    }
  };

  const handleAuth = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    // Simular login exitoso
    setUser({
      username: username || 'Usuario',
      tier: 'free',
      alvaeSymbol: ''
    });
    setShowLogin(false);
  };

  const handleRegister = (provider) => {
    // Simular registro exitoso
    setUser({
      username: `Usuario_${provider}`,
      tier: 'free',
      alvaeSymbol: ''
    });
    setShowRegister(false);
  };

  const handlePlaySong = (songName) => {
    console.log(`Reproduciendo: ${songName}`);
    // Aquí se implementaría la lógica de reproducción
  };

  const handlePurchaseTier = (tierName) => {
    console.log(`Comprando tier: ${tierName}`);
    // Aquí se implementaría la integración con Stripe
  };

  const handleNexusClick = () => {
    const newClicks = nexusClicks + 1;
    setNexusClicks(newClicks);
    
    if (newClicks >= 5) {
      // Secuencia épica de activación NEXUS
      console.log('🌌 INICIANDO SECUENCIA NEXUS ÉPICA...');
      
      // 1. Pantalla negra completa
      document.body.style.transition = 'all 0.3s ease';
      document.body.style.background = '#000000';
      document.body.style.color = '#000000';
      
      // 2. Mostrar símbolo ALVAE con líneas doradas
      setTimeout(() => {
        const nexusOverlay = document.createElement('div');
        nexusOverlay.id = 'nexus-overlay';
        nexusOverlay.innerHTML = `
          <div class="nexus-symbol-container">
            <div class="nexus-alvae-symbol">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FFD700" stroke-width="3"/>
                <path d="M35 25 L50 15 L65 25 L55 40 L65 55 L50 65 L35 55 L45 40 Z" fill="#FFD700" stroke="#FFD700" stroke-width="2"/>
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
              </svg>
            </div>
            <div class="nexus-golden-lines">
              <div class="golden-line line-1"></div>
              <div class="golden-line line-2"></div>
              <div class="golden-line line-3"></div>
              <div class="golden-line line-4"></div>
            </div>
            <div class="nexus-text-epic">MODO NEXUS ACTIVADO</div>
          </div>
        `;
        document.body.appendChild(nexusOverlay);
        
        // 3. Activar modo NEXUS después de la secuencia
        setTimeout(() => {
          setNexusMode(true);
          setNexusClicks(0);
          console.log('🌌 MODO NEXUS ACTIVADO!');
          
          // Activar funciones
          activateKanjisRain();
          activateFrontendTransition();
          activateTools();
          
          // 4. Limpiar overlay y restaurar fondo
          setTimeout(() => {
            const overlay = document.getElementById('nexus-overlay');
            if (overlay) {
              overlay.remove();
            }
            document.body.style.background = '';
            document.body.style.color = '';
          }, 2000);
        }, 1500);
      }, 500);
    }
  };

  const activateKanjisRain = () => {
    console.log('🌸 Lluvia de Kanjis Activada');
    // Aquí se implementaría la lluvia de kanjis
  };

  const activateFrontendTransition = () => {
    console.log('🔄 Transición de Frontends Activada');
    // Aquí se implementaría la transición entre frontends
  };

  const activateTools = () => {
    console.log('🛠️ Herramientas Activadas');
    // Aquí se activarían todas las herramientas del ecosistema
  };

  const handleCodexMaestro = () => {
    console.log('📚 Redirigiendo al Codex Maestro');
    // Aquí se implementaría la redirección al Codex Maestro
    window.open('https://codex-maestro.son1kvers3.com', '_blank');
  };

  const handleTheGenerator = () => {
    console.log('🎵 Activando The Generator');
    // Aquí se implementaría la activación de The Generator
    window.open('https://the-generator.son1kvers3.com', '_blank');
  };

  // ────────────────────────────────────────────────────────────────────────────────
  // RENDERIZADO CONDICIONAL
  // ────────────────────────────────────────────────────────────────────────────────

  if (enter) {
    return (
      <div className="min-h-screen bg-gray-900">
        <SubdomainDetector />
        <Son1kverseMain userId={userId} sessionId={sessionId} />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // INTERFAZ PROFESIONAL PRINCIPAL
  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen bg-gray-900 ${nexusMode ? 'nexus-mode-active' : ''}`}>
      {/* Indicador de Modo NEXUS */}
      {nexusMode && (
        <div className="nexus-mode-indicator">
          <div className="nexus-glow-effect"></div>
          <div className="nexus-text">🌌 MODO NEXUS ACTIVADO 🌌</div>
          <div className="nexus-subtitle">Lluvia de Kanjis • Transición de Frontends • Herramientas Activadas</div>
        </div>
      )}
      
      {/* Navegación Profesional */}
      <nav className="navbar-professional">
        <div className="navbar-left">
          <div className="logo-container">
            <img src="/logo-soni1k.svg" alt="Son1kVers3 Logo" className="official-logo-svg" />
          </div>
          <div className="brand-text">SON1KVERS3</div>
        </div>
        
        <div className="navbar-center">
          <a href="#historia" className="nav-link active">Historia</a>
          <a href="#ghost-studio" className="nav-link">Ghost Studio</a>
          <a href="#generacion" className="nav-link">Generación</a>
          <a href="#the-generator" className="nav-link" onClick={(e) => { e.preventDefault(); handleTheGenerator(); }}>The Generator</a>
          <a href="#pixel" className="nav-link">Pixel</a>
          <a href="#archivo" className="nav-link">Archivo</a>
          <a href="#santuario" className="nav-link">Santuario</a>
          <a href="#planes" className="nav-link">Planes</a>
        </div>
        
        <div className="navbar-right">
          <div className="status-indicator">
            <div className={`status-dot ${backendOnline ? 'online' : ''}`}></div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-white text-sm">Hola, {user.username}</span>
                  <button 
                    className="btn-secondary"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowLogin(true)}
                  >
                    Iniciar Sesión
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowRegister(true)}
                  >
                    Registrarse
                  </button>
                </>
              )}
              <button 
                className="cta-button"
                onClick={() => setEnter(true)}
              >
                Entrar al Estudio
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Línea Divisoria Verde de Luz al ras de las pestañas */}
      <div className="section-divider-nav"></div>

      {/* Hero Section Profesional */}
      <section className="hero-professional">
        <div className="hero-content">
          <div className="hero-left slide-in-left">
            <div className="hero-subtitle">LA RESISTENCIA</div>
            <h1 className="hero-title">
              Lo imperfecto también es sagrado
            </h1>
            <p className="hero-description">
              Componer con alma en un mundo de máquinas.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary"
                onClick={() => setEnter(true)}
              >
                Entrar al Estudio
              </button>
              <button 
                className="btn-secondary"
                onClick={handleCodexMaestro}
              >
                Codex Maestro
              </button>
            </div>
          </div>
          
          <div className="hero-right slide-in-right">
            <div className="interactive-panel">
              <h3 className="panel-title">Controles Creativos</h3>
              
              <div className="controls-grid">
                <div className="dial-control">
                  <div className="dial">
                    <div className="dial-indicator"></div>
                  </div>
                  <div className="dial-label">Tono</div>
                </div>
                <div className="dial-control">
                  <div className="dial">
                    <div className="dial-indicator"></div>
                  </div>
                  <div className="dial-label">Ritmo</div>
                </div>
                <div className="dial-control">
                  <div className="dial">
                    <div className="dial-indicator"></div>
                  </div>
                  <div className="dial-label">Armonía</div>
                </div>
              </div>
              
              <div className="slider-control">
                <div className="slider-label">
                  <span className="slider-title">Expresividad</span>
                  <span className="slider-value">75%</span>
                </div>
                <input 
                  type="range" 
                  className="slider" 
                  min="0" 
                  max="100" 
                  defaultValue="75"
                />
              </div>
              
              <div className="panel-buttons">
                <button className="panel-btn panel-btn-primary">
                  Test Rápido
                </button>
                <button className="panel-btn panel-btn-secondary">
                  Generar Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Línea Divisoria Verde de Luz */}
      <div className="section-divider"></div>

      {/* Sección de Descripción */}
      <section className="content-section">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-300 leading-relaxed">
            Genera música, clona voces cantadas, mezcla con calidad de estudio y guarda tu proceso en un archivo vivo. 
            Bienvenido al Estudio Fantasma.
          </p>
        </div>
      </section>

      {/* Sección de Características */}
      <section className="content-section">
        <h2 className="section-title">El Universo Son1kVers3</h2>
        <p className="section-subtitle">
          Una plataforma completa para la democratización musical
        </p>
        
        <div className="features-grid">
          <div className="feature-card fade-in">
            <h3 className="feature-title">Generación Musical</h3>
            <p className="feature-description">
              Beats, letras, voces cantadas clonadas y mezcla con calidad de estudio. Todo en un flujo.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Voces APLIO</span>
              <span className="feature-tag">Perilla de Expresividad</span>
              <span className="feature-tag">Pre-producción guiada</span>
            </div>
          </div>
          
          <div className="feature-card fade-in">
            <h3 className="feature-title">Ghost Studio</h3>
            <p className="feature-description">
              Sube tu demo o escribe un prompt. El Estudio Fantasma devuelve una maqueta con mezcla y carácter.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Análisis IA</span>
              <span className="feature-tag">Arreglos</span>
              <span className="feature-tag">Mezcla profesional</span>
            </div>
          </div>
          
          <div className="feature-card fade-in">
            <h3 className="feature-title">Pixel Assistant</h3>
            <p className="feature-description">
              Asistente virtual inteligente que aprende de tus preferencias creativas y te ayuda en cada paso.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">IA Adaptativa</span>
              <span className="feature-tag">Aprendizaje</span>
              <span className="feature-tag">Sugerencias</span>
            </div>
          </div>
          
          <div className="feature-card fade-in">
            <h3 className="feature-title">The Generator</h3>
            <p className="feature-description">
              Generación de letras con perillas literarias y control creativo total sobre el proceso.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Letras IA</span>
              <span className="feature-tag">Control Creativo</span>
              <span className="feature-tag">Perillas literarias</span>
            </div>
          </div>
          
          <div className="feature-card fade-in">
            <h3 className="feature-title">Nova Post Pilot</h3>
            <p className="feature-description">
              Marketing digital automatizado para promocionar tu música en redes sociales.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Marketing IA</span>
              <span className="feature-tag">Redes Sociales</span>
              <span className="feature-tag">Automatización</span>
            </div>
          </div>
          
          <div className="feature-card fade-in">
            <h3 className="feature-title">Sanctuary</h3>
            <p className="feature-description">
              Red social para músicos y comunidad creativa global. Colabora y comparte tu arte.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Comunidad</span>
              <span className="feature-tag">Colaboración</span>
              <span className="feature-tag">Red Social</span>
            </div>
          </div>
        </div>
      </section>

      {/* Línea Divisoria Verde de Luz */}
      <div className="section-divider"></div>

      {/* Sección Top 10 */}
      <section className="content-section">
        <div className="top-10-section">
          <h2 className="top-10-title">Top 10 Canciones Generadas</h2>
          <div className="top-10-grid">
            <div className="top-10-item">
              <div className="top-10-rank">1</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Neon Dreams')}
              >
                ▶
              </button>
              <div className="top-10-song">Neon Dreams</div>
              <div className="top-10-artist">AI Composer</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">2</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Digital Symphony')}
              >
                ▶
              </button>
              <div className="top-10-song">Digital Symphony</div>
              <div className="top-10-artist">Ghost Studio</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">3</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Electric Pulse')}
              >
                ▶
              </button>
              <div className="top-10-song">Electric Pulse</div>
              <div className="top-10-artist">Pixel Assistant</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">4</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Cyber Ballad')}
              >
                ▶
              </button>
              <div className="top-10-song">Cyber Ballad</div>
              <div className="top-10-artist">The Generator</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">5</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Quantum Melody')}
              >
                ▶
              </button>
              <div className="top-10-song">Quantum Melody</div>
              <div className="top-10-artist">Nova Pilot</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">6</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Holographic Beat')}
              >
                ▶
              </button>
              <div className="top-10-song">Holographic Beat</div>
              <div className="top-10-artist">Sanctuary</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">7</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Neural Network')}
              >
                ▶
              </button>
              <div className="top-10-song">Neural Network</div>
              <div className="top-10-artist">AI Composer</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">8</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Virtual Reality')}
              >
                ▶
              </button>
              <div className="top-10-song">Virtual Reality</div>
              <div className="top-10-artist">Ghost Studio</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">9</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Algorithmic Soul')}
              >
                ▶
              </button>
              <div className="top-10-song">Algorithmic Soul</div>
              <div className="top-10-artist">Pixel Assistant</div>
            </div>
            <div className="top-10-item">
              <div className="top-10-rank">10</div>
              <button 
                className="top-10-play"
                onClick={() => handlePlaySong('Digital Revolution')}
              >
                ▶
              </button>
              <div className="top-10-song">Digital Revolution</div>
              <div className="top-10-artist">The Generator</div>
            </div>
          </div>
        </div>
      </section>

      {/* Línea Divisoria Verde de Luz */}
      <div className="section-divider"></div>

      {/* Sección de Tiers */}
      <section className="content-section">
        <div className="tiers-section">
          <h2 className="tiers-title">Planes de Suscripción</h2>
          <p className="tiers-subtitle">
            Elige el plan que mejor se adapte a tus necesidades creativas
          </p>
          
          <div className="tiers-grid">
            <div className="tier-card">
              <h3 className="tier-name">FREE</h3>
              <div className="tier-price">$0 <span className="period">/mes</span></div>
              <ul className="tier-features">
                <li>5 generaciones totales</li>
                <li>3 modelo 3.5 + 2 modelo 5</li>
                <li>Compartir con marca de agua</li>
                <li>Sin descargas</li>
                <li>Pixel básico</li>
              </ul>
              <button 
                className="tier-button"
                onClick={() => handlePurchaseTier('FREE')}
              >
                Comenzar Gratis
              </button>
            </div>
            
            <div className="tier-card">
              <h3 className="tier-name">PRO</h3>
              <div className="tier-price">$19 <span className="period">/mes</span></div>
              <ul className="tier-features">
                <li>100 generaciones totales</li>
                <li>50 modelo 3.5 + 50 modelo 5</li>
                <li>Compartir con marca de agua</li>
                <li>30 descargas</li>
                <li>Nova Post Pilot básico</li>
                <li>Sanctuary limitado</li>
              </ul>
              <button 
                className="tier-button"
                onClick={() => handlePurchaseTier('PRO')}
              >
                Comprar Pro
              </button>
            </div>
            
            <div className="tier-card popular">
              <h3 className="tier-name">PREMIUM</h3>
              <div className="tier-price">$49 <span className="period">/mes</span></div>
              <ul className="tier-features">
                <li>200 generaciones totales</li>
                <li>100 modelo 3.5 + 100 modelo 5</li>
                <li>Compartir sin marca de agua</li>
                <li>Descargas ilimitadas</li>
                <li>Nova Post Pilot completo</li>
                <li>Sanctuary completo</li>
                <li>Modo NEXUS incluido</li>
              </ul>
              <button 
                className="tier-button"
                onClick={() => handlePurchaseTier('PREMIUM')}
              >
                Comprar Premium
              </button>
            </div>
            
            <div className="tier-card">
              <h3 className="tier-name">ENTERPRISE</h3>
              <div className="tier-price">$99 <span className="period">/mes</span></div>
              <ul className="tier-features">
                <li>Modelo 3.5 ilimitado</li>
                <li>300 generaciones modelo 5</li>
                <li>Compartir y descargas ilimitadas</li>
                <li>Nova Post Pilot completo</li>
                <li>Sanctuary completo</li>
                <li>API personalizada</li>
                <li>Soporte dedicado 24/7</li>
              </ul>
              <button 
                className="tier-button"
                onClick={() => handlePurchaseTier('ENTERPRISE')}
              >
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Login */}
      {showLogin && (
        <div className="login-modal">
          <div className="login-content">
            <button 
              className="login-close"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>
            <h2 className="login-title">Iniciar Sesión</h2>
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                className="login-input"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                className="login-input"
                required
              />
              <button type="submit" className="login-button">
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      {showRegister && (
        <div className="register-modal">
          <div className="register-content">
            <button 
              className="login-close"
              onClick={() => setShowRegister(false)}
            >
              ×
            </button>
            <h2 className="register-title">Crear Cuenta</h2>
            
            <div className="social-login">
              <button 
                className="social-btn google"
                onClick={() => handleRegister('Google')}
              >
                Gmail
              </button>
              <button 
                className="social-btn facebook"
                onClick={() => handleRegister('Facebook')}
              >
                Facebook
              </button>
              <button 
                className="social-btn tiktok"
                onClick={() => handleRegister('TikTok')}
              >
                TikTok
              </button>
              <button 
                className="social-btn"
                onClick={() => handleRegister('Email')}
              >
                Email
              </button>
            </div>
            
            <div className="divider-text">
              <span>o regístrate con email</span>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleRegister('Email'); }} className="login-form">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className="login-input"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                className="login-input"
                required
              />
              <button type="submit" className="login-button">
                Crear Cuenta
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Botón NEXUS Escondido - Descubrimiento */}
      <button 
        className="nexus-hidden-button"
        onClick={handleNexusClick}
        title={`Activar Modo NEXUS (${nexusClicks}/5)`}
      >
        ⚡
      </button>
    </div>
  );
}

export default App;