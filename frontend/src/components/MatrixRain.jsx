import { useEffect, useRef } from "react";

export default function MatrixRain({
  color = "#00FFE7",
  fontSize = 18,
  speedInitial = 34,    // rápido al inicio
  speedCalm = 70,       // más lento después
  opacityInitial = 0.15,
  opacityCalm = 0.08,
  settleAfterMs = 5000, // 5 segundos para bajar intensidad
  transitionMs = 1000,  // transición suave de 1s
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const glyphs =
      "アカサタナハマヤラワイキシチニヒミリヰウクスツヌフムユルエケセテネヘメレヱオコソトノホモヨロヲ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () =>
      Math.floor(Math.random() * canvas.height / fontSize)
    );

    let speed = speedInitial;
    let opacity = opacityInitial;
    let start = performance.now();
    let transitionStart = null;

    const draw = (now) => {
      const elapsed = now - start;

      // inicia transición a los 5s
      if (elapsed >= settleAfterMs && !transitionStart) {
        transitionStart = now;
      }

      if (transitionStart) {
        const t = Math.min(1, (now - transitionStart) / transitionMs);
        speed = speedInitial + (speedCalm - speedInitial) * t;
        opacity = opacityInitial + (opacityCalm - opacityInitial) * t;
      }

      ctx.fillStyle = `rgba(10,12,16,${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = glyphs[(Math.random() * glyphs.length) | 0];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      }

      rafRef.current = setTimeout(() => requestAnimationFrame(draw), speed);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", setSize);
    };
  }, [
    color,
    fontSize,
    speedInitial,
    speedCalm,
    opacityInitial,
    opacityCalm,
    settleAfterMs,
    transitionMs,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 1 }}
    />
  );
}
