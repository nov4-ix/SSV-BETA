import React, { useEffect, useMemo, useState } from "react";
// ✅ Diseño: dark, elegante, con acentos neon (azul glitch / rosa)
// ✅ Librerías pensadas para Vite + Tailwind + shadcn/ui (opcionales):
//    - Tailwind ya estiliza. Si usas shadcn/ui, puedes mapear los estilos fácilmente.
// ✅ Este componente es autónomo y puede pegarse como App.jsx en un proyecto Vite React.
// ✅ Endpoints configurables para ALFA-SSV (ajusta API_BASE o usa variables de entorno).

// ────────────────────────────────────────────────────────────────────────────────
// CONFIG API
// ────────────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8000"; // cambia según tu backend
const API = {
  health: () => `${API_BASE}/health`,
  // generación musical a partir de texto o demo
  generate: () => `${API_BASE}/generate`, // POST { prompt, preset, tags, knobs }
  // lista de voces APLIO
  voices: () => `${API_BASE}/voices`, // GET
  // preview de mezcla / clip corto
  preview: () => `${API_BASE}/preview`, // POST { prompt|file, knobs }
  // subir demo de audio
  upload: () => `${API_BASE}/upload`, // POST multipart/form-data { file }
  // verificar integridad de APIs externas
  checkApis: () => `${API_BASE}/integrations/check`, // GET
  // archivo de proyectos del usuario
  archive: () => `${API_BASE}/archive`, // GET (query), POST (save)
  // auth (placeholder)
  login: () => `${API_BASE}/auth/login`,
};

// ────────────────────────────────────────────────────────────────────────────────
// PALETA & UTILIDADES DE UI
// ────────────────────────────────────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(" ");
const palette = {
  bg: "#0b0b0d",
  panel: "#0f1218",
  card: "#10131a",
  ink: "#161a22",
  text: "#e7e7ea",
  muted: "#b9b9c2",
  neon: "#00d1ff",
  pink: "#ff49c3",
  gold: "#ffcc00",
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
          online ? "bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)]"
        )}
      />
      <span className="text-xs text-neutral-400">{online ? "Backend Online" : "Backend Offline"}</span>
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

function GhostSlider({ label, value, setValue, suffix = "%" }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>{label}</span>
        <span className="text-neutral-300">{Math.round(value)}{suffix}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-neutral-800 accent-cyan-400"
      />
    </div>
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
              <GhostSlider label="Expresividad" value={75} setValue={() => {}} />
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
// GHOST STUDIO (núcleo de UX)
// ────────────────────────────────────────────────────────────────────────────────
function GhostStudio() {
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("una balada emotiva con piano y cuerdas, estilo neo-soul, tempo 70 BPM, voz femenina expresiva");
  const [preset, setPreset] = useState("Professional");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("pop, ballad, emotional, piano");
  const [demoFile, setDemoFile] = useState(null);

  // knobs / mezcla rápida
  const [tuning, setTuning] = useState(60);
  const [express, setExpress] = useState(75);
  const [eqLow, setEqLow] = useState(20);
  const [eqMid, setEqMid] = useState(45);
  const [eqHigh, setEqHigh] = useState(35);
  const [air, setAir] = useState(50);
  const [saturation, setSaturation] = useState(30);

  const knobs = useMemo(() => ({ tuning, express, eqLow, eqMid, eqHigh, air, saturation }), [tuning, express, eqLow, eqMid, eqHigh, air, saturation]);

  useEffect(() => {
    let mounted = true;
    const ping = async () => {
      try {
        const r = await fetch(API.health());
        if (!mounted) return;
        setOnline(r.ok);
      } catch {
        setOnline(false);
      }
    };
    ping();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const body = { prompt, preset, title, tags, knobs };
      const r = await fetch(API.generate(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      alert(data?.message || (r.ok ? "Generación enviada. Revisa tu Archivo." : "No se pudo generar"));
    } catch (e) {
      console.error(e);
      alert("Error conectando con el backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyApis = async () => {
    try {
      const r = await fetch(API.checkApis());
      const d = await r.json().catch(() => ({}));
      alert("Integraciones: " + JSON.stringify(d));
    } catch {
      alert("No se pudo verificar integraciones");
    }
  };

  const handleUpload = async () => {
    if (!demoFile) return alert("Selecciona un archivo de demo");
    const fd = new FormData();
    fd.append("file", demoFile);
    try {
      const r = await fetch(API.upload(), { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      alert(d?.message || (r.ok ? "Demo subida" : "Fallo subiendo demo"));
    } catch {
      alert("Error al subir demo");
    }
  };

  return (
    <section id="ghost" className="mx-auto max-w-7xl px-4 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Ghost Studio</h2>
        <span className="text-xs text-neutral-400">·</span>
        <StatusDot online={online} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierda: Prompt */}
        <Card className="p-6">
          <div className="text-sm text-neutral-400 mb-3">Prompt de Generación Musical</div>
          <textarea
            className="w-full h-40 rounded-xl bg-neutral-950/80 border border-neutral-800 p-4 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Preset</div>
              <select value={preset} onChange={(e)=>setPreset(e.target.value)} className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-2 text-neutral-200">
                <option>Professional</option>
                <option>Demo</option>
                <option>Experimental</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-neutral-400 mb-1">Título (opcional)</div>
              <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-2 text-neutral-200" placeholder="Mi canción" />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-neutral-400 mb-1">Tags / Estilo</div>
              <input value={tags} onChange={(e)=>setTags(e.target.value)} className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-2 text-neutral-200" placeholder="pop, ballad, emotional, piano" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <NeonButton onClick={handleGenerate} disabled={loading}>{loading ? "Generando…" : "Generar Música"}</NeonButton>
            <button onClick={handleVerifyApis} className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500 transition">Verificar APIs</button>
          </div>
        </Card>

        {/* Panel derecha: Knobs */}
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GhostSlider label="Afinación" value={tuning} setValue={setTuning} />
            <GhostSlider label="Expresividad" value={express} setValue={setExpress} />

            <div className="sm:col-span-2">
              <div className="text-sm text-neutral-400 mb-3">EQ (SSL-style)</div>
              <div className="grid grid-cols-4 gap-4">
                <GhostSlider label="Low" value={eqLow} setValue={setEqLow} />
                <GhostSlider label="Mid" value={eqMid} setValue={setEqMid} />
                <GhostSlider label="High" value={eqHigh} setValue={setEqHigh} />
                <GhostSlider label="Air" value={air} setValue={setAir} />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="text-sm text-neutral-400 mb-3">Saturación (Rupert‑style)</div>
              <GhostSlider label="Drive" value={saturation} setValue={setSaturation} />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="w-full">
              <input type="file" accept="audio/*" onChange={(e)=>setDemoFile(e.target.files?.[0]||null)} className="hidden" />
              <div className="w-full px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500 transition cursor-pointer text-center">Subir demo</div>
            </label>
            <NeonButton onClick={handleUpload} className="w-full">Cargar Demo</NeonButton>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// SECCIONES ADICIONALES (Generación, Archivo, Santuario, Planes)
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
      <SectionHeader id="generacion" title="Generación Musical" />
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Voces APLIO","Perilla de Expresividad","Pre‑producción guiada"].map((t,i)=> (
          <Card key={i} className="p-5">
            <div className="text-white font-medium mb-2">{t}</div>
            <p className="text-sm text-neutral-400">Módulos listos para flujos de estudio con calidad y carácter. Todo en un mismo flujo.</p>
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
          <p className="text-neutral-300">Tu memoria creativa: canciones, presets y sesiones guardadas.</p>
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
            <p className="text-neutral-400 text-sm">La red secreta de la Divina Liga: colaboración, misiones poéticas y ritual de entrada al Estudio Fantasma.</p>
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
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LAUNCHER DE CONSOLA (imagen con hotspots enterprise)
// ────────────────────────────────────────────────────────────────────────────────
function TapeConsoleLauncher({ src }) {
  /**
   * Mapea zonas clicables (porcentaje) a herramientas.
   * Ajústalas si usas otra resolución; están calibradas para una relación ~1300x768.
   */
  const DESTS = [
    { key: 'generator', label: 'The Generator', href: 'https://the-generator.son1kvers3.com',   area: { left: 7.5,  top: 83.5, width: 6.6, height: 6.2 } },
    { key: 'ghost',     label: 'Ghost Studio',  href: 'https://ghost-studio.son1kvers3.com',     area: { left: 15.0, top: 83.5, width: 6.6, height: 6.2 } },
    { key: 'postpilot', label: 'Nova Post Pilot',href: 'https://nov4-post-pilot.son1kvers3.com',  area: { left: 22.7, top: 83.5, width: 6.6, height: 6.2 } },
    { key: 'daw',       label: 'DAW',           href: 'https://daw.son1kvers3.com',              area: { left: 30.4, top: 83.5, width: 6.6, height: 6.2 } },
    { key: 'clone',     label: 'Clone Station', href: 'https://clone-station.son1kvers3.com',    area: { left: 67.6, top: 83.5, width: 6.6, height: 6.2 } },
    { key: 'nexus',     label: 'Nexus Visual',  href: 'https://nexus.visual.son1kvers3.com',     area: { left: 75.3, top: 83.5, width: 6.6, height: 6.2 } }
  ];

  const [prefetching, setPrefetching] = React.useState(null);

  // Prefetch básico al pasar el cursor (no rompe CSP, pero permite DNS/TLS warmup)
  const warmUp = (href) => {
    try {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = new URL(href).origin;
      document.head.appendChild(link);
      setPrefetching(href);
    } catch (_) {}
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="text-white text-xl font-semibold mb-4">Launcher de Herramientas</div>
      <div className="relative w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        {/* Imagen principal */}
        <img src={src} alt="Consola de cinta – launcher de herramientas" className="w-full h-auto block select-none pointer-events-none" draggable={false} />
        {/* Hotspots */}
        {DESTS.map((d) => (
          <a
            key={d.key}
            href={d.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={d.label}
            title={d.label}
            onMouseEnter={() => warmUp(d.href)}
            className="absolute group focus:outline-none"
            style={{
              left: `${d.area.left}%`,
              top: `${d.area.top}%`,
              width: `${d.area.width}%`,
              height: `${d.area.height}%`,
            }}
          >
            <span className="sr-only">{d.label}</span>
            <span className="absolute inset-0 rounded-md ring-2 ring-transparent group-focus:ring-cyan-400" aria-hidden />
            <span aria-hidden className="absolute inset-0 rounded-md bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">Consejo: ajusta las áreas en porcentaje en <code>DESTS</code>. Incluye accesibilidad (teclado/foco), seguridad (<code>noopener</code>) y warm-up por <code>preconnect</code>.</p>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// APP
// ────────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [enter, setEnter] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    const check = async () => {
      try { const r = await fetch(API.health()); setBackendOnline(r.ok); }
      catch { setBackendOnline(false); }
    };
    check();
  }, []);

  return (
    <div style={{ background: palette.bg, color: palette.text, minHeight: '100dvh' }}>
      <Navbar online={backendOnline} onEnterStudio={() => setEnter(true)} />
      <Hero />
      <div className="mx-auto max-w-7xl px-4 mt-2">
        <Card className="p-4 mb-6">
          <p className="text-xs text-neutral-400">API Base: <span className="text-neutral-200">{API_BASE}</span></p>
        </Card>
      </div>
      {/* NEW: Launcher con hotspots sobre la imagen de consola */}
      <TapeConsoleLauncher src={import.meta?.env?.VITE_TAPE_IMG || '/tape-console.jpg'} />
      <GhostStudio />
      <GenerationDeck />
      <ArchiveStrip />
      <Sanctuary />
      <Footer />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// NOTAS DE INTEGRACIÓN (README breve)
// ────────────────────────────────────────────────────────────────────────────────
// 1) Crea proyecto Vite:
//    npm create vite@latest sv-frontend -- --template react
//    cd sv-frontend && npm i && npm i -D tailwindcss postcss autoprefixer
//    npx tailwindcss init -p
// 2) tailwind.config.js -> content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"]
// 3) index.css -> @tailwind base; @tailwind components; @tailwind utilities;
// 4) En .env: VITE_API_BASE=http://localhost:8000 (o URL de ALFA-SSV)
// 5) Reemplaza App.jsx por este archivo y arranca: npm run dev
// 6) Endpoints usados (ajústalos a tu repo ALFA-SSV):
//    GET    /health
//    GET    /voices
//    POST   /generate        { prompt, preset, title, tags, knobs }
//    POST   /preview         { prompt|file, knobs }
//    POST   /upload          multipart/form-data (file)
//    GET    /integrations/check
//    GET/POST /archive
// 7) Los módulos de UI son neutrales: si utilizas shadcn/ui, mapea NeonButton → <Button variant="ghost"/> y Card→<Card/>.