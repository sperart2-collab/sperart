"use client";
import { useEffect, useState } from "react";
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  function toggle() {
    const d = !dark; setDark(d);
    document.documentElement.classList.toggle("dark", d);
    try { localStorage.setItem("sp-theme", d ? "dark" : "light"); } catch {}
  }
  return <button onClick={toggle} aria-label="Switch between light and dark mode" className="grid h-10 w-10 place-items-center rounded-full border border-gold/60 transition hover:shadow-[0_0_14px_#FFC93C]">{dark ? "☀" : "☾"}</button>;
}
