"use client";
import { useEffect, useRef } from "react";
/** Floating ember particles. Pauses when tab hidden; skipped if reduced motion. */
export default function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext("2d")!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0, h = 0, raf = 0;
    const fit = () => { w = cv.width = cv.offsetWidth; h = cv.height = cv.offsetHeight; };
    fit(); addEventListener("resize", fit);
    const n = w < 700 ? 35 : 70;
    const ps = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.6, v: Math.random() * 0.5 + 0.15, d: Math.random() * 6 }));
    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.v; p.x += Math.sin(t / 1500 + p.d) * 0.3;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
        const col = p.d > 3 ? "#FFC93C" : "#4C8DFF"; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12; ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", fit); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}
