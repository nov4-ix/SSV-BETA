import { useEffect, useRef } from "react";

export default function GlitchTitle({ title="NEXUS ACTIVADO", subtitle="Bienvenido a la Resistencia." }) {
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current;
    let t = 0;
    const id = setInterval(()=>{
      t++;
      el.style.textShadow = `
        ${Math.sin(t*0.7)*2}px 0 8px #00FFE7,
        ${Math.cos(t*0.9)*-2}px 0 12px #ff4dd2
      `;
    }, 60);
    return ()=>clearInterval(id);
  },[]);
  return (
    <div className="glitch-wrap">
      <h1 ref={ref} className="glitch-title">{title}</h1>
      <p className="glitch-sub">{subtitle}</p>
    </div>
  );
}
