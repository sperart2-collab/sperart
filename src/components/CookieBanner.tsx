"use client";
import { useEffect, useState } from "react";
export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("sp-cookies")) return;
    const t = setTimeout(() => setShow(true), 3800);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div role="dialog" aria-label="Cookies" className="fixed inset-x-4 bottom-4 z-[90] max-w-md rounded-2xl border border-blue/20 bg-white p-4 shadow-2xl md:left-6">
      <p className="text-sm text-ink/80">We use essential cookies to keep you signed in and the site working. <a href="/privacy" className="underline">Privacy</a></p>
      <button className="btn btn-blue mt-3 !px-5 !py-2" onClick={() => { localStorage.setItem("sp-cookies", "1"); setShow(false); }}>Accept cookies</button>
    </div>
  );
}
