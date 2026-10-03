"use client";
import { useState } from "react";
const links = [["What we do", "#what"], ["About", "#about"], ["Contact", "#contact"]];
export default function Header() {
  const [o, setO] = useState(false);
  return (
    <header className="site fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-5 py-3 md:px-12">
        <a href="/" className="flex items-center gap-2"><img src="/emblem.png" alt="" className="h-9 w-auto" /><span className="font-semibold tracking-[.2em]">SPERART</span></a>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {links.map(([t, h]) => <a key={h} href={h} className="nl">{t}</a>)}
          <a href="/login" className="btn btn-blue !px-5 !py-2">Sign in</a>
        </nav>
        <button className="grid h-11 w-11 place-items-center text-2xl md:hidden" aria-label="Menu" aria-expanded={o} onClick={() => setO(!o)}>{o ? "✕" : "☰"}</button>
      </div>
      {o && (
        <nav className="flex flex-col gap-1 bg-white px-5 pb-5 text-ink md:hidden">
          {links.map(([t, h]) => <a key={h} href={h} onClick={() => setO(false)} className="py-3 text-lg">{t}</a>)}
          <a href="/login" className="btn btn-blue mt-2">Sign in</a>
          <a href="/join" className="btn mt-2 border border-gold text-ink">Become a member</a>
        </nav>
      )}
    </header>
  );
}
