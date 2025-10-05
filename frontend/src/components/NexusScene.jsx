import { useMemo } from "react";
import MatrixRain from "./MatrixRain.jsx";

/** Iconos mínimos */
const Icons = {
  ghost:(p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M12 3c4.2 0 7 2.9 7 7v9l-2.2-1.5L14.6 20l-2.6-1.5L9.4 20l-2.2-1.5L5 19V10c0-4.1 2.8-7 7-7Z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="9.5" cy="10" r="1.2" fill="currentColor"/><circle cx="14.5" cy="10" r="1.2" fill="currentColor"/></svg>),
  codex:(p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M5 5h9.5a4.5 4.5 0 0 1 0 9H5z" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M5 14h9.5A4.5 4.5 0 0 1 19 18.5V19H5z" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>),
  clone:(p)=>(<svg viewBox="0 0 24 24" {...p}><rect x="4" y="4" width="9" height="9" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><rect x="11" y="11" width="9" height="9" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>),
  liga:(p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M5 6h14v12H5z" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M8 9h8M8 12h8M8 15h6" stroke="currentColor" strokeWidth="1.6"/></svg>),
  alvae:(p)=>(<svg viewBox="0 0 24 24" {...p}><path d="M12 3l6.5 9L12 21 5.5 12 12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>),
  res:(p)=>(<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>),
};

const ITEMS = [
  { key:"ghost",  label:"GHOST STUDIO",  icon:Icons.ghost },
  { key:"codex",  label:"CODEX",         icon:Icons.codex },
  { key:"clone",  label:"CLONE STATION", icon:Icons.clone },
  { key:"liga",   label:"LA LIGA",       icon:Icons.liga },
  { key:"alvae",  label:"ALVAE",         icon:Icons.alvae },
  { key:"res",    label:"RESISTENCIA",   icon:Icons.res },
];

export default function NexusScene({ onSelect=()=>{} }) {
  const R = Math.min(window.innerWidth, window.innerHeight) * 0.30;     // radio anillo
  const OUT = 120;                                                      // distancia de iconos fuera
  const pos = useMemo(()=>{
    const deg = [270, 330, 30, 90, 150, 210];
    return ITEMS.map((it,i)=>{
      const a = deg[i]*(Math.PI/180), r=R+OUT;
      return {...it, x: Math.cos(a)*r, y: Math.sin(a)*r};
    });
  },[R]);

  return (
    <div className="nexus-root">
      {/* Lluvia tenue y continua */}
      <MatrixRain color="#00FFE7" speed={20} density={0.9} opacity={0.10} />

      {/* Títulos centrados con fuente cool */}
      <div className="nexus-center">
        <h1 className="nexus-title">NEXUS ACTIVADO</h1>
        <p className="nexus-sub">¡Bienvenido a la Resistencia!</p>
      </div>

      {/* Anillo con glitches */}
      <div className="nexus-portal">
        <div className="ring ring-glitch">
          <span className="slice"></span>
          <span className="slice2"></span>
        </div>
      </div>

      {/* Iconos alrededor */}
      {pos.map((it)=>{
        const Icon = it.icon;
        return (
          <button key={it.key}
            className="icon-chip"
            style={{ left:`calc(50% + ${it.x}px)`, top:`calc(50% + ${it.y}px)` }}
            onClick={()=>onSelect(it.key)} title={it.label}>
            <span className="icon-wrap"><Icon className="icon" /></span>
            <span className="icon-label">{it.label}</span>
          </button>
        )
      })}
    </div>
  );
}
