"use client";
import { useRef, useState } from "react";
/** Plays sources in order, forever (1-2-3-4-1-2...). A broken file is skipped. */
export default function VideoPlaylist({ sources }: { sources: string[] }) {
  const [i, setI] = useState(0);
  const errs = useRef(0);
  const next = () => setI((n) => (n + 1) % sources.length);
  return (
    <video key={i} className="h-full w-full object-cover" src={sources[i]} autoPlay muted playsInline preload="auto"
      loop={sources.length === 1} onPlaying={() => (errs.current = 0)} onEnded={next}
      onError={() => { if (++errs.current < sources.length * 2) next(); }} />
  );
}
