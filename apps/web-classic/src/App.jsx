import React, { useState, useEffect } from 'react';
import Son1kverseMain from './components/Son1kverseMain';

// ────────────────────────────────────────────────────────────────────────────────
// CONFIG API
// ────────────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8000";

// ────────────────────────────────────────────────────────────────────────────────
// PALETA & UTILIDADES DE UI
// ────────────────────────────────────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(" ");
const palette = {
  bg: "#0b0b0d", // Very dark blue-black background
  panel: "#0f1218", // Slightly lighter dark blue-gray for panels
  card: "#10131a", // Card backgrounds
  ink: "#161a22", // Darker ink color
  text: "#e7e7ea", // Light gray/off-white text
  muted: "#b9b9c2", // Lighter gray for muted text
  neon: "#00d1ff", // Neon cyan accent
  pink: "#ff49c3", // Pink accent for glitch effects
  gold: "#ffcc00", // Gold accent
  status: {
    online: "#00ff88", // Green for online status
    offline: "#ff4444", // Red for offline status
  }
};

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
        style={{ background: online ? palette.status.online : palette.status.offline }}
      />
      <span className="text-xs" style={{ color: palette.muted }}>{online ? "Backend Online" : "Backend Offline"}</span>
    </span>
  );
}

function NeonButton({ children, className, ...props }) {
  return (
    <button
      className={cx(
        "px-4 py-2 rounded-xl border transition-transform duration-150",
        "bg-[rgba(0,209,255,0.06)] border-[rgba(0,209,255,0.25)]",
        "text-[15px] text-white hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(0,209,255,0.35)]",
        className
      )}
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
      style={{ backgroundColor: palette.card }}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ────────────────────────────────────────────────────────────────────────────────
function Navbar({ online, onEnterStudio }) {
  return (
    <div className="sticky top-0 z-40 border-b border-neutral-900/80" style={{ background: "linear-gradient(180deg,#0f121a 0%,#0b0b0d 100%)" }}>
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-neutral-900 border border-neutral-700 grid place-items-center text-xs font-semibold" style={{color: palette.neon}}>SV</div>
          <div className="text-sm tracking-wider text-neutral-300">SON1KVERS3</div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          <a className="hover:text-white" href="#historia">Historia</a>
          <a className="hover:text-white" href="#ghost">Ghost Studio</a>
          <a className="hover:text-white" href="#generacion">Generación</a>
          <a className="hover:text-white" href="#archivo">Archivo</a>
          <a className="hover:text-white" href="#santuario">Santuario</a>
          <a className="hover:text-white" href="#planes">Planes</a>
        </nav>

        <div className="flex items-center gap-4">
          <StatusDot online={online} />
          <NeonButton onClick={onEnterStudio} className="ml-2">Entrar al Estudio</NeonButton>
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
          <p className="text-xs tracking-[0.25em] text-neutral-400 mb-4">LA RESISTENCIA</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            <span className="text-white">Lo imperfecto </span>
            <span className="bg-clip-text text-transparent" style={{backgroundImage:"linear-gradient(90deg,#fff 0%,#ff49c3 45%,#00d1ff 100%)"}}>también</span>
            <span className="text-white"> es sagrado</span>
          </h1>
          <p className="mt-6 text-2xl text-neutral-300 max-w-2xl">Componer con alma en un mundo de máquinas.</p>
          <p className="mt-3 text-neutral-400 max-w-2xl text-sm">Genera música, clona voces cantadas, mezcla con calidad de estudio y guarda tu proceso en un archivo vivo. Bienvenido al Estudio Fantasma.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <NeonButton onClick={() => document.querySelector('#ghost')?.scrollIntoView({behavior:'smooth'})}>Entrar al Estudio</NeonButton>
            <button className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500 transition">Conocer el Universo</button>
          </div>
        </div>

        <div className="col-span-5">
          <Card className="p-5">
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                {[0,1,2].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-neutral-900 border border-neutral-800 grid place-items-center text-neutral-300">◯</div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-sm text-neutral-400 mb-2">🤖 Pixel Learning System</div>
                <div className="text-xs text-neutral-500">Sistema de aprendizaje adaptativo activo</div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NeonButton className="w-full">Test Rápido</NeonButton>
                <button className="w-full px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500 transition">Generar Preview</button>
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
        <button onClick={onCta} className="text-sm text-cyan-300 hover:text-white">{cta} →</button>
      )}
    </div>
  );
}

function GenerationDeck() {
  return (
    <section id="generacion" className="pb-8">
      <SectionHeader id="generacion" title="Generación Musical con IA" />
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "🤖 Pixel Assistant", desc: "Asistente virtual con personalidad profunda" },
          { title: "🎵 Generación de Letras", desc: "Letras con coherencia narrativa usando Qwen 2" },
          { title: "🧠 Prompts Inteligentes", desc: "Mejora automática de prompts musicales" },
          { title: "🌐 Traducción Automática", desc: "Traducción invisible español-inglés para Suno" },
          { title: "🎛️ Integración Suno", desc: "Generación musical completa con IA" },
          { title: "📊 Sistema de Aprendizaje", desc: "Pixel aprende y se adapta al usuario" }
        ].map((t,i)=> (
          <Card key={i} className="p-5">
            <div className="text-white font-medium mb-2">{t.title}</div>
            <p className="text-sm text-neutral-400">{t.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ArchiveStrip() {
  return (
    <section id="archivo" className="pb-8">
      <SectionHeader id="archivo" title="El Archivo" cta="Ver todo" onCta={()=>{}} />
      <div className="mx-auto max-w-7xl px-4">
        <Card className="p-6">
          <p className="text-neutral-300">Tu memoria creativa: canciones, presets y sesiones guardadas con sistema de aprendizaje personalizado.</p>
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
            <NeonButton>Activar Premium</NeonButton>
            <button className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500 transition">Ver ritual</button>
          </div>
        </Card>
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

  // Página de landing por defecto
  return (
    <div style={{ background: palette.bg, color: palette.text, minHeight: '100dvh' }}>
      <Navbar online={backendOnline} onEnterStudio={() => setEnter(true)} />
      <Hero />
      <div className="mx-auto max-w-7xl px-4 mt-2">
        <Card className="p-4 mb-6">
          <p className="text-xs text-neutral-400">API Base: <span className="text-neutral-200">{API_BASE}</span></p>
          <p className="text-xs text-neutral-400 mt-1">User ID: <span className="text-neutral-200">{userId}</span></p>
          <p className="text-xs text-neutral-400 mt-1">Session ID: <span className="text-neutral-200">{sessionId}</span></p>
        </Card>
      </div>
      <GenerationDeck />
      <ArchiveStrip />
      <Sanctuary />
      <Footer />
    </div>
  );
}