"use client";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
const main = [["About", "/about"], ["Media", "/media"], ["News", "/news"], ["Academy", "/academy"], ["Membership", "/membership"]];
const more = [["Events", "/events"], ["Recognition", "/recognition"], ["Library", "/library"], ["Contact", "/#contact"]];
export default function Header({ solid = false }: { solid?: boolean }) {
  const [o, setO] = useState(false);
  return (
    <header className={`site ${solid ? "solid " : ""}fixed inset-x-0 top-0 z-50`}>
      <div className="flex items-center justify-between px-5 py-3 md:px-12">
        <a href="/" className="flex items-center gap-2"><img src="/emblem.png" alt="" className="h-14 w-14 object-contain md:h-16 md:w-16" /><span className="font-semibold tracking-[.2em]">SPERART</span></a>
        <nav className="hidden items-center gap-7 text-[15px] lg:flex xl:gap-10">
          {main.map(([t, h]) => <a key={h} href={h} className="nl">{t}</a>)}
          <details className="relative"><summary className="nl cursor-pointer list-none">More ▾</summary>
            <div className="absolute right-0 mt-3 w-44 rounded-xl bg-white p-2 text-ink shadow-xl">{more.map(([t, h]) => <a key={h} href={h} className="block rounded-lg px-3 py-2 hover:bg-bone">{t}</a>)}</div>
          </details>
          <ThemeToggle /><a href="/login" className="btn btn-blue !px-5 !py-2">Sign in</a>
        </nav>
        <div className="flex items-center gap-2 lg:hidden"><ThemeToggle /><button className="grid h-11 w-11 place-items-center text-2xl" aria-label="Menu" aria-expanded={o} onClick={() => setO(!o)}>{o ? "✕" : "☰"}</button></div>
      </div>
      {o && (
        <nav className="flex max-h-[80vh] flex-col gap-1 overflow-y-auto bg-white px-5 pb-5 text-ink lg:hidden">
          {[...main, ...more].map(([t, h]) => <a key={h} href={h} onClick={() => setO(false)} className="py-3 text-lg">{t}</a>)}
          <a href="/login" className="btn btn-blue mt-2">Sign in</a>
          <a href="/join" className="btn mt-2 border border-gold text-ink">Become a member</a>
        </nav>
      )}
    </header>
  );
}
