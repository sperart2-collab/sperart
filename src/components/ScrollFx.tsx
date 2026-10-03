"use client";
import { useEffect } from "react";
/** Scroll progress bar, hero parallax variable, header style, and reveal-on-scroll. */
export default function ScrollFx() {
  useEffect(() => {
    const root = document.documentElement;
    const on = () => {
      const y = scrollY, max = root.scrollHeight - innerHeight;
      root.style.setProperty("--y", String(y));
      root.style.setProperty("--p", String(max > 0 ? y / max : 0));
      document.querySelector("header")?.classList.toggle("scrolled", y > 40);
    };
    on(); addEventListener("scroll", on, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => { removeEventListener("scroll", on); io.disconnect(); };
  }, []);
  return <div className="progress" aria-hidden />;
}
