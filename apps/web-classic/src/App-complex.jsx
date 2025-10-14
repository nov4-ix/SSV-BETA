import React, { useState, useEffect } from 'react';
import { SubdomainDetector } from './components/SubdomainDetector';
import { Son1kverseMain } from './components/Son1kverseMain';
import Son1kMusicGenerator from './components/Son1kMusicGenerator';
import './components/Son1kMusicGenerator.css';

// ────────────────────────────────────────────────────────────────────────────────
// CONFIG API
// ────────────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8000";

// ────────────────────────────────────────────────────────────────────────────────
// PALETA & UTILIDADES DE UI
// ────────────────────────────────────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(" ");

// Paleta por defecto
const defaultPalette = {
  bg: "#1A1A2E", // Fondo principal azul oscuro exacto
  panel: "#16213E", // Superficie secundaria
  card: "#0F3460", // Tarjetas y paneles
  ink: "#333344", // Bordes sutiles
  text: "#FFFFFF", // Texto principal blanco
  muted: "#888888", // Texto secundario gris
  neon: "#66FF66", // Verde/teal exacto para elementos interactivos
  pink: "#ff1744", // Rosa para acentos
  gold: "#ffd700", // Dorado para ALVAE
  purple: "#9c27b0", // Púrpura para highlights
  cyan: "#00bcd4", // Cyan para elementos especiales
  status: {
    online: "#4caf50", // Verde para estados online
    offline: "#f44336", // Rojo para estados offline
  }
};

// Función para cargar paleta desde localStorage
const loadPalette = () => {
  try {
    const savedPalette = localStorage.getItem('son1kvers3_palette');
    if (savedPalette) {
      return JSON.parse(savedPalette);
    }
  } catch (error) {
    console.error('Error loading palette:', error);
  }
  return defaultPalette;
};

// Paleta actual (se actualiza dinámicamente)
let palette = loadPalette();

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTES DE AUTENTICACIÓN
// ────────────────────────────────────────────────────────────────────────────────
function AuthModal({ isOpen, onClose, mode, onModeChange }) {
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
               console.log('Login:', formData.email);
               
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
               console.log('Register:', formData);
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-neutral-800 text-white px-4 py-3 rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500"
                placeholder="Tu nombre de usuario"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-neutral-800 text-white px-4 py-3 rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-neutral-800 text-white px-4 py-3 rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500"
              placeholder="••••••••"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-neutral-800 text-white px-4 py-3 rounded-lg border border-neutral-600 focus:outline-none focus:border-orange-500"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Procesando...' : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
            className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
          >
            {mode === 'login' 
              ? '¿No tienes cuenta? Regístrate' 
              : '¿Ya tienes cuenta? Inicia sesión'
            }
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-neutral-500">
          Al continuar, aceptas nuestros{' '}
          <a href="#" className="text-orange-400 hover:text-orange-300">Términos de Servicio</a>
          {' '}y{' '}
          <a href="#" className="text-orange-400 hover:text-orange-300">Política de Privacidad</a>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// COMPONENTES BÁSICOS
// ────────────────────────────────────────────────────────────────────────────────
function StatusDot({ online }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        className={cx(
          "h-2.5 w-2.5 rounded-full",
          online ? "shadow-[0_0_12px_rgba(0,255,136,0.9)]" : "shadow-[0_0_12px_rgba(255,68,68,0.9)]"
        )}
        style={{ background: online ? currentPalette.status.online : currentPalette.status.offline }}
      />
      <span className="text-xs" style={{ color: currentPalette.muted }}>{online ? "Backend Online" : "Backend Offline"}</span>
    </span>
  );
}

function NeonButton({ children, className, ...props }) {
  return (
    <button
      className={cx(
        "px-4 py-2 rounded-xl border transition-all duration-300",
        "text-[15px] font-semibold hover:scale-[1.02]",
        "hover:shadow-[0_0_20px_rgba(102,255,102,0.6)]",
        "active:scale-[0.98]",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${currentPalette.neon} 0%, #4CAF50 100%)`,
        border: `2px solid ${currentPalette.neon}`,
        color: currentPalette.bg,
        boxShadow: `0 0 15px ${currentPalette.neon}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}
      {...props}
    />
  );
}

function Card({ children, className }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-neutral-800/80",
        "bg-[rgba(255,255,255,0.01)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_40px_rgba(0,0,0,0.35)]",
        "backdrop-blur-sm",
        className
      )}
      style={{ backgroundColor: currentPalette.card }}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ────────────────────────────────────────────────────────────────────────────────
function Navbar({ online, onEnterStudio, user, onLogin, onLogout }) {
  return (
    <div className="sticky top-0 z-40 border-b" style={{ 
      background: `linear-gradient(180deg, ${currentPalette.panel} 0%, ${currentPalette.bg} 100%)`,
      borderColor: currentPalette.ink
    }}>
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md border grid place-items-center text-xs font-semibold" style={{
            background: currentPalette.card,
            borderColor: currentPalette.ink,
            color: currentPalette.cyan
          }}>SV</div>
          <div className="text-sm tracking-wider" style={{color: currentPalette.text}}>SON1KVERS3</div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm" style={{color: currentPalette.text}}>
          <a className="hover:opacity-80 transition-opacity" href="#historia">Codex Maestro</a>
          <a className="hover:opacity-80 transition-opacity" href="https://ghost-studio-1e38nw4c2-son1kvers3s-projects-c3cdfb54.vercel.app" target="_blank">Ghost Studio</a>
          <a className="hover:opacity-80 transition-opacity" href="https://the-generator-9f0w4cruh-son1kvers3s-projects-c3cdfb54.vercel.app" target="_blank">The Generator</a>
          <a className="hover:opacity-80 transition-opacity" href="#santuario">Santuario</a>
          <a className="hover:opacity-80 transition-opacity" href="https://nov4-post-pilot.son1kvers3.com" target="_blank">Nov4-Post-Pilot</a>
          <a className="hover:opacity-80 transition-opacity" href="#planes">Planes</a>
        </nav>

        <div className="flex items-center gap-4">
          <StatusDot online={online} />
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-neutral-300">
                <span className="text-orange-400">👋</span> 
                <span className="text-yellow-400 font-bold">
                  {user.alvaeSymbol || ''}
                </span>
                {user.username}
                <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                  {user.tier}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cerrar Sesión
              </button>
              <NeonButton onClick={onEnterStudio} className="ml-2">Entrar al Estudio</NeonButton>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onLogin('login')}
                className="px-4 py-2 text-sm text-neutral-300 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </button>
              <NeonButton onClick={() => onLogin('register')}>Registrarse</NeonButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// HERO / PORTADA
// ────────────────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="historia" className="mx-auto max-w-7xl px-4 pt-16 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="col-span-7">
          <p className="text-xs tracking-[0.25em] mb-4" style={{color: currentPalette.muted}}>LA RESISTENCIA</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            <span style={{color: currentPalette.text}}>Lo imperfecto </span>
            <span className="bg-clip-text text-transparent" style={{backgroundImage:`linear-gradient(90deg,${currentPalette.text} 0%,${currentPalette.pink} 45%,${currentPalette.cyan} 100%)`}}>también</span>
            <span style={{color: currentPalette.text}}> es sagrado</span>
          </h1>
          <p className="mt-6 text-2xl max-w-2xl" style={{color: currentPalette.text}}>Componer con alma en un mundo de máquinas.</p>
          <p className="mt-3 max-w-2xl text-sm" style={{color: currentPalette.muted}}>Genera música, clona voces cantadas, mezcla con calidad de estudio y guarda tu proceso en un archivo vivo. Bienvenido al Estudio Fantasma.</p>
          
          {/* Redirección al Codex Maestro */}
          <div className="mt-4">
            <button 
              onClick={() => document.querySelector('#historia')?.scrollIntoView({behavior:'smooth'})}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 text-sm font-semibold hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,188,212,0.4)]"
              style={{
                borderColor: currentPalette.cyan,
                background: `linear-gradient(135deg, ${currentPalette.cyan}20 0%, ${currentPalette.cyan}10 100%)`,
                color: currentPalette.cyan,
                boxShadow: `0 0 10px ${currentPalette.cyan}30`
              }}
            >
              📚 Acceder al Codex Maestro
              <span style={{color: currentPalette.cyan}}>→</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <NeonButton onClick={() => document.querySelector('#generacion')?.scrollIntoView({behavior:'smooth'})}>Entrar al Estudio</NeonButton>
            <button 
              className="px-4 py-2 rounded-xl border transition"
              style={{
                borderColor: currentPalette.ink,
                color: currentPalette.text,
                background: 'transparent'
              }}
            >
              Conocer el Universo
            </button>
          </div>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Tempo", value: 120 },
                  { label: "Harmony", value: 75 },
                  { label: "Dynamics", value: 85 }
                ].map((knob, i) => (
                  <div key={i} className="h-20 rounded-xl grid place-items-center" style={{
                    background: currentPalette.card,
                    border: `1px solid ${currentPalette.ink}`
                  }}>
                    <div className="relative w-12 h-12">
                      {/* Perilla circular */}
                      <div className="absolute inset-0 rounded-full border-2" style={{
                        borderColor: currentPalette.ink,
                        background: currentPalette.panel
                      }}></div>
                      {/* Indicador */}
                      <div 
                        className="absolute top-1 left-1/2 w-0.5 h-4 transform -translate-x-1/2 origin-bottom"
                        style={{ 
                          transform: `translateX(-50%) rotate(${(knob.value / 100) * 270 - 135}deg)`,
                          background: currentPalette.cyan
                        }}
                      ></div>
                      {/* Valor */}
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-mono" style={{color: currentPalette.text}}>
                        {knob.value}
                      </div>
                    </div>
                    <div className="text-xs mt-1" style={{color: currentPalette.muted}}>{knob.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-sm mb-2" style={{color: currentPalette.muted}}>🤖 Pixel Learning System</div>
                <div className="text-xs" style={{color: currentPalette.muted}}>Sistema de aprendizaje adaptativo activo</div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NeonButton className="w-full">Test Rápido</NeonButton>
                <button 
                  className="w-full px-4 py-2 rounded-xl border transition"
                  style={{
                    borderColor: currentPalette.ink,
                    color: currentPalette.text,
                    background: 'transparent'
                  }}
                >
                  Generar Preview
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// SECCIONES ADICIONALES
// ────────────────────────────────────────────────────────────────────────────────
function SectionHeader({ id, title, cta, onCta }) {
  return (
    <div id={id} className="mx-auto max-w-7xl px-4 pt-6 pb-4 flex items-center justify-between">
      <h3 className="text-xl md:text-2xl text-white font-semibold">{title}</h3>
      {cta && (
        <button onClick={onCta} className="text-sm text-orange-400 hover:text-white">{cta} →</button>
      )}
    </div>
  );
}

function WeeklyTop10() {
  const topGenerations = [
    { rank: 1, title: "Midnight Dreams", artist: "Pixel_User_001", plays: 2847, genre: "Electronic" },
    { rank: 2, title: "Echoes of Tomorrow", artist: "Ghost_Studio_Pro", plays: 2156, genre: "Ambient" },
    { rank: 3, title: "Neon Streets", artist: "Suno_Master", plays: 1983, genre: "Synthwave" },
    { rank: 4, title: "Digital Love", artist: "AI_Composer", plays: 1765, genre: "Pop" },
    { rank: 5, title: "Quantum Beats", artist: "Pixel_User_042", plays: 1543, genre: "Experimental" },
    { rank: 6, title: "Crystal Memories", artist: "Ghost_Studio_Pro", plays: 1421, genre: "Chill" },
    { rank: 7, title: "Virtual Reality", artist: "Suno_Master", plays: 1298, genre: "Future Bass" },
    { rank: 8, title: "Pixel Dreams", artist: "AI_Composer", plays: 1156, genre: "Indie" },
    { rank: 9, title: "Digital Sunset", artist: "Pixel_User_001", plays: 1034, genre: "Lo-fi" },
    { rank: 10, title: "Neural Network", artist: "Ghost_Studio_Pro", plays: 987, genre: "Techno" }
  ];

  return (
    <section id="top10" className="pb-8">
      <SectionHeader id="top10" title="Top 10 Generaciones Semanales" cta="Ver ranking completo" onCta={() => {}} />
      <div className="mx-auto max-w-7xl px-4">
        <Card className="p-6">
          <div className="space-y-4">
            {topGenerations.map((track, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:border-orange-500/50 transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < 3 ? 'bg-gradient-to-r from-orange-500 to-purple-500 text-white' : 'bg-neutral-600 text-neutral-300'
                  }`}>
                    {track.rank}
                  </div>
                  <div>
                    <div className="text-white font-semibold group-hover:text-orange-300 transition-colors">
                      {track.title}
                    </div>
                    <div className="text-sm text-neutral-400">
                      por {track.artist} • {track.genre}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-orange-400 font-semibold">{track.plays.toLocaleString()}</div>
                    <div className="text-xs text-neutral-500">reproducciones</div>
                  </div>
                  <button className="w-8 h-8 bg-orange-500/20 hover:bg-orange-500/40 rounded-full flex items-center justify-center text-orange-400 hover:text-orange-300 transition-all duration-200">
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
              🎵 Ver Todas las Generaciones
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function ToolsLauncher() {
  return (
    <section id="herramientas" className="pb-12">
      <SectionHeader id="herramientas" title="Launcher de Herramientas" />
      <div className="mx-auto max-w-7xl px-4">
        <Card className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Imagen del grabador de cinta */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Simulación del grabador de cinta vintage */}
                <div className="w-80 h-60 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg border-2 border-gray-600 shadow-2xl relative overflow-hidden">
                  {/* Reels */}
                  <div className="absolute top-4 left-8 w-16 h-16 bg-gray-600 rounded-full border-2 border-gray-500 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-full border border-gray-400"></div>
                  </div>
                  <div className="absolute top-4 right-8 w-16 h-16 bg-gray-600 rounded-full border-2 border-gray-500 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-full border border-gray-400"></div>
                  </div>
                  
                  {/* Tape path */}
                  <div className="absolute top-12 left-8 w-64 h-1 bg-amber-800"></div>
                  
                  {/* Head assembly */}
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-600 rounded border border-gray-500">
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Control panel */}
                  <div className="absolute bottom-8 left-4 right-4 h-20 bg-gray-700 rounded border border-gray-600">
                    {/* Buttons */}
                    <div className="absolute top-2 left-2 w-6 h-6 bg-orange-500 rounded border border-orange-400 shadow-lg"></div>
                    <div className="absolute top-2 left-10 w-6 h-6 bg-gray-600 rounded border border-gray-500"></div>
                    <div className="absolute top-2 left-18 w-6 h-6 bg-gray-600 rounded border border-gray-500"></div>
                    
                    {/* Knob */}
                    <div className="absolute top-2 right-8 w-8 h-8 bg-gray-600 rounded-full border-2 border-gray-500"></div>
                    
                    {/* Speed buttons */}
                    <div className="absolute bottom-2 left-2 w-8 h-4 bg-orange-500 rounded text-xs text-white flex items-center justify-center font-mono">7.5</div>
                    <div className="absolute bottom-2 left-12 w-8 h-4 bg-orange-500 rounded text-xs text-white flex items-center justify-center font-mono">15</div>
                    
                    {/* Transport */}
                    <div className="absolute bottom-2 right-8 w-6 h-4 bg-orange-500 rounded text-xs text-white flex items-center justify-center">♪</div>
                    <div className="absolute bottom-2 right-2 w-6 h-4 bg-gray-600 rounded text-xs text-gray-300 flex items-center justify-center">⏹</div>
                  </div>
                  
                  {/* Display */}
                  <div className="absolute top-2 right-2 w-16 h-6 bg-black border border-gray-500 rounded text-green-400 text-xs font-mono flex items-center justify-center">
                    0 1 BAR
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de herramientas luminosos */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-6">🎛️ Herramientas Disponibles</h3>
              
              {/* Ghost Studio */}
              <button
                onClick={() => window.open('https://ghost-studio-1e38nw4c2-son1kvers3s-projects-c3cdfb54.vercel.app', '_blank')}
                className="w-full p-4 rounded-lg border-2 font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-between group"
                style={{
                  borderColor: `${currentPalette.purple}80`,
                  background: `linear-gradient(135deg, ${currentPalette.purple}20 0%, ${currentPalette.purple}10 100%)`,
                  color: currentPalette.text,
                  boxShadow: `0 0 15px ${currentPalette.purple}40`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{
                    background: `linear-gradient(135deg, ${currentPalette.purple} 0%, ${currentPalette.pink} 100%)`,
                    boxShadow: `0 0 10px ${currentPalette.purple}60`
                  }}>👻</div>
                  <span>Ghost Studio</span>
                </div>
                <span style={{color: currentPalette.purple}}>→</span>
              </button>

              {/* The Generator */}
              <button
                onClick={() => window.open('https://the-generator-9f0w4cruh-son1kvers3s-projects-c3cdfb54.vercel.app', '_blank')}
                className="w-full p-4 rounded-lg border-2 font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-between group"
                style={{
                  borderColor: `${currentPalette.neon}80`,
                  background: `linear-gradient(135deg, ${currentPalette.neon}20 0%, ${currentPalette.neon}10 100%)`,
                  color: currentPalette.text,
                  boxShadow: `0 0 15px ${currentPalette.neon}40`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{
                    background: `linear-gradient(135deg, ${currentPalette.neon} 0%, #4CAF50 100%)`,
                    boxShadow: `0 0 10px ${currentPalette.neon}60`
                  }}>🎵</div>
                  <span>The Generator</span>
                </div>
                <span style={{color: currentPalette.neon}}>→</span>
              </button>

              {/* Santuario */}
              <button
                onClick={() => document.querySelector('#santuario')?.scrollIntoView({behavior:'smooth'})}
                className="w-full p-4 rounded-lg border-2 font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-between group"
                style={{
                  borderColor: `${currentPalette.cyan}80`,
                  background: `linear-gradient(135deg, ${currentPalette.cyan}20 0%, ${currentPalette.cyan}10 100%)`,
                  color: currentPalette.text,
                  boxShadow: `0 0 15px ${currentPalette.cyan}40`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{
                    background: `linear-gradient(135deg, ${currentPalette.cyan} 0%, #00BCD4 100%)`,
                    boxShadow: `0 0 10px ${currentPalette.cyan}60`
                  }}>🏛️</div>
                  <span>Santuario</span>
                </div>
                <span style={{color: currentPalette.cyan}}>→</span>
              </button>

              {/* Nov4-Post-Pilot */}
              <button
                onClick={() => window.open('https://nov4-post-pilot.son1kvers3.com', '_blank')}
                className="w-full p-4 rounded-lg border-2 font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-between group"
                style={{
                  borderColor: `${currentPalette.pink}80`,
                  background: `linear-gradient(135deg, ${currentPalette.pink}20 0%, ${currentPalette.pink}10 100%)`,
                  color: currentPalette.text,
                  boxShadow: `0 0 15px ${currentPalette.pink}40`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{
                    background: `linear-gradient(135deg, ${currentPalette.pink} 0%, #E91E63 100%)`,
                    boxShadow: `0 0 10px ${currentPalette.pink}60`
                  }}>🚀</div>
                  <span>Nov4-Post-Pilot</span>
                </div>
                <span style={{color: currentPalette.pink}}>→</span>
              </button>

              {/* Planes */}
              <button
                onClick={() => document.querySelector('#planes')?.scrollIntoView({behavior:'smooth'})}
                className="w-full p-4 rounded-lg border-2 font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-between group"
                style={{
                  borderColor: `${currentPalette.gold}80`,
                  background: `linear-gradient(135deg, ${currentPalette.gold}20 0%, ${currentPalette.gold}10 100%)`,
                  color: currentPalette.text,
                  boxShadow: `0 0 15px ${currentPalette.gold}40`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{
                    background: `linear-gradient(135deg, ${currentPalette.gold} 0%, #FFC107 100%)`,
                    boxShadow: `0 0 10px ${currentPalette.gold}60`
                  }}>💎</div>
                  <span>Planes</span>
                </div>
                <span style={{color: currentPalette.gold}}>→</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function ArchiveStrip() {
  const userCreations = [
    { id: 1, title: "Mi Primera Canción", date: "2025-01-15", genre: "Rock", status: "Completada", plays: 45 },
    { id: 2, title: "Experimento Electrónico", date: "2025-01-14", genre: "Electronic", status: "Completada", plays: 23 },
    { id: 3, title: "Balada Melancólica", date: "2025-01-13", genre: "Ballad", status: "En Proceso", plays: 0 },
    { id: 4, title: "Ritmo Urbano", date: "2025-01-12", genre: "Hip-Hop", status: "Completada", plays: 67 },
    { id: 5, title: "Sinfonía Digital", date: "2025-01-11", genre: "Orchestral", status: "Completada", plays: 89 }
  ];

  return (
    <section id="archivo" className="pb-8">
      <SectionHeader id="archivo" title="Mi Archivo Personal" cta="Ver historial completo" onCta={()=>{}} />
      <div className="mx-auto max-w-7xl px-4">
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">📁 Mis Creaciones</h3>
            <p className="text-neutral-400">Tu memoria creativa personal: canciones, presets y sesiones guardadas con sistema de aprendizaje adaptativo.</p>
          </div>

          <div className="space-y-3">
            {userCreations.map((creation) => (
              <div key={creation.id} className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg border border-neutral-700 hover:border-orange-500/30 transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    🎵
                  </div>
                  <div>
                    <div className="text-white font-semibold group-hover:text-orange-300 transition-colors">
                      {creation.title}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {creation.date} • {creation.genre} • {creation.status}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-orange-400 font-semibold">{creation.plays}</div>
                    <div className="text-xs text-neutral-500">reproducciones</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 bg-orange-500/20 hover:bg-orange-500/40 rounded-full flex items-center justify-center text-orange-400 hover:text-orange-300 transition-all duration-200">
                      ▶
                    </button>
                    <button className="w-8 h-8 bg-neutral-600/20 hover:bg-neutral-600/40 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-300 transition-all duration-200">
                      ⚙
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{userCreations.length}</div>
              <div className="text-sm text-neutral-400">Total Creaciones</div>
            </div>
            <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {userCreations.reduce((sum, c) => sum + c.plays, 0)}
              </div>
              <div className="text-sm text-neutral-400">Reproducciones</div>
            </div>
            <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {userCreations.filter(c => c.status === 'Completada').length}
              </div>
              <div className="text-sm text-neutral-400">Completadas</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Sanctuary() {
  return (
    <section id="santuario" className="pb-20">
      <div className="mx-auto max-w-7xl px-4">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <div className="text-white text-xl font-semibold mb-1">El Santuario — Modo Premium</div>
            <p className="text-neutral-400 text-sm">La red secreta de la Divina Liga: colaboración, misiones poéticas y ritual de entrada al Estudio Fantasma con Pixel como compañero.</p>
          </div>
          <div className="flex gap-3">
            <NeonButton onClick={() => window.open('https://sanctuary.son1kvers3.com', '_blank')}>Activar Premium</NeonButton>
            <button className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500 transition">Ver ritual</button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function PlansSection() {
  const plans = [
    {
      name: "FREE",
      price: "Gratis",
      period: "Para siempre",
      features: [
        "5 generaciones/mes (3 modelo 3.5 + 2 modelo 5)",
        "Compartir en redes sociales con marca de agua",
        "Acceso básico a Pixel Assistant",
        "The Generator y Ghost Studio",
        "Comunidad pública",
        "Soporte por email"
      ],
      color: "border-gray-500",
      bgColor: "bg-gray-800/50",
      buttonText: "Comenzar Gratis",
      buttonAction: () => window.open('https://son1kvers3.com/register', '_blank'),
      stripeLink: null
    },
    {
      name: "PRO",
      price: "$29",
      period: "por mes",
      features: [
        "100 generaciones/mes (50 modelo 3.5 + 50 modelo 5)",
        "Compartir en redes sociales con marca de agua",
        "Descargas de tracks",
        "Acceso a Nov4-Post-Pilot",
        "Acceso limitado a Santuario (comentarios limitados)",
        "Pixel Assistant completo",
        "The Generator y Ghost Studio",
        "Soporte prioritario"
      ],
      color: "border-orange-500",
      bgColor: "bg-orange-800/20",
      popular: true,
      buttonText: "Suscribirse Ahora",
      buttonAction: () => window.open('https://buy.stripe.com/son1kvers3-pro', '_blank'),
      stripeLink: "https://buy.stripe.com/son1kvers3-pro"
    },
    {
      name: "PREMIUM",
      price: "$79",
      period: "por mes",
      features: [
        "150 generaciones/mes (50 modelo 3.5 + 100 modelo 5)",
        "Compartir en redes sociales",
        "Descargas ilimitadas",
        "Acceso completo a Santuario",
        "Nov4-Post-Pilot con calendario y autogestión",
        "Pixel Assistant avanzado",
        "The Generator y Ghost Studio",
        "Soporte premium 24/7",
        "Beta features tempranas"
      ],
      color: "border-purple-500",
      bgColor: "bg-purple-800/20",
      premium: true,
      buttonText: "Upgrade Premium",
      buttonAction: () => window.open('https://buy.stripe.com/son1kvers3-premium', '_blank'),
      stripeLink: "https://buy.stripe.com/son1kvers3-premium"
    },
    {
      name: "ENTERPRISE",
      price: "Personalizado",
      period: "Contactar ventas",
      features: [
        "Modelo 3.5 ilimitado + 200 generaciones modelo 5/mes",
        "Compartir en redes sociales",
        "Descargas ilimitadas",
        "Acceso completo a Santuario",
        "Nov4-Post-Pilot con calendario y autogestión",
        "The Creator brandeado en sus plataformas",
        "Gestión de nuestro generador",
        "Soporte dedicado 24/7",
        "Onboarding personalizado",
        "Facturación empresarial"
      ],
      color: "border-cyan-500",
      bgColor: "bg-cyan-800/20",
      buttonText: "Contactar Ventas",
      buttonAction: () => window.open('mailto:sales@son1kvers3.com?subject=Enterprise%20Plan%20Inquiry', '_blank'),
      stripeLink: null
    }
  ];

  return (
    <section id="planes" className="pb-20">
      <SectionHeader id="planes" title="Planes de Suscripción" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">🚀 Elige tu Plan Perfecto</h2>
          <p className="text-neutral-400 max-w-3xl mx-auto">
            Desde creadores independientes hasta empresas, tenemos el plan ideal para tu creatividad musical. 
            Todos los planes incluyen acceso a The Generator y Ghost Studio para generaciones modelo 5.
          </p>
          <div className="mt-4 text-sm text-neutral-500">
            💡 <strong>Nota:</strong> Las generaciones modelo 3.5 son más rápidas, las modelo 5 son de mayor calidad
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <Card key={i} className={`relative p-6 ${plan.bgColor} border-2 ${plan.color} ${plan.popular ? 'ring-2 ring-orange-500/50 scale-105' : ''} ${plan.premium ? 'ring-2 ring-purple-500/50 scale-105' : ''} transition-all duration-300 hover:scale-105`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                  ⭐ MÁS POPULAR
                </div>
              )}
              {plan.premium && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                  👑 PREMIUM VIP
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-4xl font-bold ${plan.premium ? 'text-purple-400' : 'text-orange-400'}`}>{plan.price}</span>
                  <span className="text-neutral-400 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-neutral-300">
                    <span className={`mt-0.5 ${plan.premium ? 'text-purple-400' : 'text-orange-400'}`}>✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <button 
                  onClick={plan.buttonAction}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 text-white shadow-lg hover:shadow-orange-500/25' 
                      : plan.premium
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
                        : plan.name === 'FREE'
                          ? 'border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white'
                          : 'border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white'
                  }`}
                >
                  {plan.buttonText}
                </button>

                {plan.stripeLink && (
                  <div className="text-center">
                    <a 
                      href={plan.stripeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs text-neutral-500 transition-colors ${plan.premium ? 'hover:text-purple-400' : 'hover:text-orange-400'}`}
                    >
                      💳 Pagar con Stripe
                    </a>
                  </div>
                )}

                {plan.name === 'FREE' && (
                  <div className="text-center">
                    <span className="text-xs text-neutral-500">
                      Sin tarjeta de crédito requerida
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <Card className="p-6 bg-gradient-to-r from-orange-800/10 to-purple-800/10 border border-orange-500/30">
            <h3 className="text-xl font-bold text-white mb-4">🔒 Garantía de Satisfacción</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="text-orange-400">🛡️</span>
                <span>Cancelación en cualquier momento</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400">💳</span>
                <span>Pagos seguros con Stripe</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400">🎵</span>
                <span>Acceso inmediato tras el pago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-900/80 mt-12" style={{background: "#0e1118"}}>
      <div className="mx-auto max-w-7xl px-4 py-8 text-xs text-neutral-400">
        © Son1kVers3 2025 · Archivo Central · PX‑COM // PROTOCOL‑ALPHA.01 · Sello de lo Imperfecto ¤⚡
        <br />
        Powered by Qwen 2, Supabase, Netlify Functions, y Pixel Learning System
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// APP PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [enter, setEnter] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Estado de autenticación
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [currentPalette, setCurrentPalette] = useState(loadPalette());

  // Cargar usuario desde localStorage al iniciar
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

  // Escuchar cambios en la paleta de colores
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'son1kvers3_palette') {
        try {
          const newPalette = JSON.parse(e.newValue || '{}');
          setCurrentPalette(newPalette);
        } catch (error) {
          console.error('Error parsing palette update:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar cambios en la misma ventana
    const interval = setInterval(() => {
      const savedPalette = localStorage.getItem('son1kvers3_palette');
      if (savedPalette) {
        try {
          const newPalette = JSON.parse(savedPalette);
          if (JSON.stringify(newPalette) !== JSON.stringify(currentPalette)) {
            setCurrentPalette(newPalette);
          }
        } catch (error) {
          console.error('Error checking palette update:', error);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentPalette]);

  // Manejar login/registro
  const handleAuth = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleAuthClose = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
    // Recargar usuario después del login/registro
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

  useEffect(() => {
    const check = async () => {
      try { 
        console.log('Checking backend health at:', `${API_BASE}/health`);
        const r = await fetch(`${API_BASE}/health`); 
        console.log('Backend response:', r.status, r.ok);
        setBackendOnline(r.ok); 
      }
      catch (error) { 
        console.error('Backend health check failed:', error);
        setBackendOnline(false); 
      }
    };
    check();
    // Check every 5 seconds
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  // Si el usuario entra al estudio, mostrar el componente principal
  if (enter) {
    return (
      <Son1kverseMain 
        userId={userId}
        sessionId={sessionId}
      />
    );
  }

  // Detectar subdominio y mostrar herramienta correspondiente
  const hostname = window.location.hostname;
  if (hostname.includes('.son1kvers3.com') || hostname.includes('son1kvers3.com')) {
    return (
      <SubdomainDetector 
        userId={userId}
        sessionId={sessionId}
      />
    );
  }

  // Página de landing por defecto
  return (
    <div style={{ background: currentPalette.bg, color: currentPalette.text, minHeight: '100dvh' }}>
      <Navbar 
        online={backendOnline} 
        onEnterStudio={() => setEnter(true)}
        user={user}
        onLogin={handleAuth}
        onLogout={handleLogout}
      />
      <Hero />
      
      {/* Son1k Music Generator */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{color: currentPalette.text}}>
            🎵 Generador de Música IA
          </h2>
          <p className="text-lg" style={{color: currentPalette.muted}}>
            Genera música profesional con inteligencia artificial usando Suno
          </p>
        </div>
        <Son1kMusicGenerator />
      </section>

      {/* Son1kVerse Backend Test */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{color: currentPalette.text}}>
            🌌 Backend Test Panel
          </h2>
          <p className="text-lg" style={{color: currentPalette.muted}}>
            Prueba todas las funciones de Netlify y servicios de Son1kVerse
          </p>
        </div>
        <Son1kVerseTest />
      </section>
      
      <div className="mx-auto max-w-7xl px-4 mt-2">
        <Card className="p-4 mb-6">
          <p className="text-xs text-neutral-400">API Base: <span className="text-neutral-200">{API_BASE}</span></p>
          <p className="text-xs text-neutral-400 mt-1">User ID: <span className="text-neutral-200">{userId}</span></p>
          <p className="text-xs text-neutral-400 mt-1">Session ID: <span className="text-neutral-200">{sessionId}</span></p>
          {user && (
            <p className="text-xs text-neutral-400 mt-1">
              Usuario: 
              <span className="text-yellow-400 font-bold">{user.alvaeSymbol || ''}</span>
              <span className="text-orange-400">{user.username} ({user.tier})</span>
            </p>
          )}
        </Card>
      </div>
      <WeeklyTop10 />
      <ToolsLauncher />
      <ArchiveStrip />
      <Sanctuary />
      <PlansSection />
      <Footer />
      
      {/* Modal de autenticación */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleAuthClose}
        mode={authModal.mode}
        onModeChange={handleModeChange}
      />
    </div>
  );
}