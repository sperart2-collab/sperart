"use client";

import { useEffect, useState } from "react";
import Particles from "./Particles";

export default function Splash() {
  const [state, setState] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    try {
      if (sessionStorage.getItem("sp-seen")) {
        setState("gone");
        return;
      }
    } catch {}

    const fadeTimer = window.setTimeout(() => setState("fade"), 2600);
    const finishTimer = window.setTimeout(() => {
      setState("gone");
      try {
        sessionStorage.setItem("sp-seen", "1");
      } catch {}
    }, 3150);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (state === "gone") return null;

  return (
    <div
      aria-label="SPERART opening animation"
      className={`sperart-intro fixed inset-0 z-[100] grid place-items-center overflow-hidden transition-opacity duration-500 ${
        state === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F3EEFF] to-[#FFF7FC]" />
      <Particles />

      <div className="sperart-intro-content relative z-10 flex flex-col items-center px-6 text-center">
        <img
          src="/emblem.png"
          alt="SPERART"
          className="mb-5 h-20 w-20 object-contain sm:h-24 sm:w-24"
        />

        <div className="sperart-drum-stage" role="img" aria-label="An animated percussion drum">
          <svg
            className="sperart-drum"
            viewBox="0 0 220 210"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="drumShell" x1="40" y1="65" x2="180" y2="160" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D9C5FF" />
                <stop offset=".5" stopColor="#B79AE8" />
                <stop offset="1" stopColor="#8B6BC0" />
              </linearGradient>
              <linearGradient id="drumSkin" x1="50" y1="50" x2="170" y2="85" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#F3EEFF" />
              </linearGradient>
            </defs>

            <ellipse cx="110" cy="163" rx="63" ry="13" fill="#B79AE8" opacity=".16" />

            <g className="sperart-drum-body">
              <path d="M53 68 L61 143 Q110 172 159 143 L167 68 Z" fill="url(#drumShell)" />
              <path d="M61 91 L68 144 M83 97 L87 155 M110 99 L110 161 M137 97 L133 155 M159 91 L152 144"
                stroke="#FFFFFF" strokeOpacity=".72" strokeWidth="3" strokeLinecap="round" />
              <path d="M53 68 L61 143 Q110 172 159 143 L167 68" stroke="#8B6BC0" strokeWidth="3" />
              <ellipse cx="110" cy="68" rx="57" ry="21" fill="#B79AE8" />
              <ellipse cx="110" cy="65" rx="53" ry="17" fill="url(#drumSkin)" stroke="#8B6BC0" strokeWidth="2" />
              <ellipse cx="110" cy="65" rx="39" ry="10" stroke="#D9C5FF" strokeWidth="1.5" />
              <path d="M67 76 L72 91 M153 76 L148 91" stroke="#FFFFFF" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
            </g>

            <g className="sperart-drum-wave" stroke="#B79AE8" strokeWidth="3" strokeLinecap="round">
              <path d="M32 65 Q18 86 32 107" />
              <path d="M20 54 Q-1 86 20 118" opacity=".65" />
              <path d="M188 65 Q202 86 188 107" />
              <path d="M200 54 Q221 86 200 118" opacity=".65" />
            </g>

            <g className="sperart-drum-sparkles" fill="#D9C5FF">
              <path d="M44 32 L48 43 L59 47 L48 51 L44 62 L40 51 L29 47 L40 43 Z" />
              <path d="M174 28 L177 36 L185 39 L177 42 L174 50 L171 42 L163 39 L171 36 Z" />
              <circle cx="177" cy="135" r="3" />
              <circle cx="42" cy="133" r="2.5" />
            </g>
          </svg>
        </div>

        <p className="mt-2 text-xs font-semibold uppercase tracking-[.42em] text-[#8B6BC0] sm:text-sm">
          SPERART
        </p>
        <p className="mt-3 text-sm tracking-wide text-[#29243A]/75 sm:text-base">
          Feel the rhythm. Keep the culture alive.
        </p>
        <div className="sperart-intro-progress mt-7 h-1 w-36 overflow-hidden rounded-full bg-[#E8DDF5]">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-[#D9C5FF] via-[#B79AE8] to-[#F5C9E8]" />
        </div>
      </div>
    </div>
  );
}
