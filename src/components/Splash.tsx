"use client";
import { useEffect, useState } from "react";
import LetterLoader from "./LetterLoader";
import Particles from "./Particles";
/** Neon letter loader with particles, about 2.6 seconds, once per browser session. */
export default function Splash() {
  const [s, setS] = useState<"show" | "fade" | "gone">("show");
  useEffect(() => {
    if (sessionStorage.getItem("sp-seen")) { setS("gone"); return; }
    const a = setTimeout(() => setS("fade"), 2600);
    const b = setTimeout(() => { setS("gone"); sessionStorage.setItem("sp-seen", "1"); }, 3100);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (s === "gone") return null;
  return (
    <div className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-navy transition-opacity duration-500 ${s === "fade" ? "opacity-0" : ""}`}>
      <Particles />
      <div className="relative"><img src="/emblem.png" alt="" className="mx-auto mb-6 h-40 w-40 object-contain drop-shadow-[0_0_18px_rgba(76,141,255,.8)]" /><LetterLoader /></div>
    </div>
  );
}
