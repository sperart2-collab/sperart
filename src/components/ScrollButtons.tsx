"use client";
import { useEffect, useState } from "react";
export default function ScrollButtons() {
  const [at, setAt] = useState({ top: true, bottom: false });
  useEffect(() => {
    const on = () => setAt({ top: scrollY < 200, bottom: scrollY + innerHeight >= document.documentElement.scrollHeight - 200 });
    on(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, []);
  const go = (t: number) => scrollTo({ top: t, behavior: "smooth" });
  const b = "grid h-11 w-11 place-items-center rounded-full border border-gold/60 bg-[var(--surface)] text-lg shadow-lg transition hover:shadow-[0_0_16px_#FFC93C]";
  return (
    <div className="fixed right-3 top-1/2 z-[60] flex -translate-y-1/2 flex-col gap-2">
      {!at.top && <button aria-label="Back to top" className={b} onClick={() => go(0)}>↑</button>}
      {!at.bottom && <button aria-label="Jump to bottom" className={b} onClick={() => go(document.documentElement.scrollHeight)}>↓</button>}
    </div>
  );
}
