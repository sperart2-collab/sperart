"use client";
import { useRef, useState } from "react";
/** Plays sources in order, forever. Fades in once playing; a broken file is skipped. */
export default function VideoPlaylist({ sources }: { sources: string[] }) {
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  const errs = useRef(0);
  const next = () => { setReady(false); setI((n) => (n + 1) % sources.length); };
  return (
    <video key={i} className={`h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`} src={sources[i]} autoPlay muted playsInline preload="auto"
      loop={sources.length === 1} onPlaying={() => { errs.current = 0; setReady(true); }} onEnded={next}
      onError={() => { if (++errs.current < sources.length * 2) next(); }} />
  );
}
