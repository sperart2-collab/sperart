"use client";
import { useEffect, useState } from "react";
/** Logo welcome screen for 3 seconds, once per browser session. */
export default function Splash() {
  const [s, setS] = useState<"show" | "fade" | "gone">("show");
  useEffect(() => {
    if (sessionStorage.getItem("sp-seen")) { setS("gone"); return; }
    const a = setTimeout(() => setS("fade"), 3000);
    const b = setTimeout(() => { setS("gone"); sessionStorage.setItem("sp-seen", "1"); }, 3500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (s === "gone") return null;
  return (
    <div className={`fixed inset-0 z-[100] grid place-items-center bg-white transition-opacity duration-500 ${s === "fade" ? "opacity-0" : ""}`}>
      <div className="w-[80vw] max-w-md">
        <img src="/logo.png" alt="SPERART" className="splash-logo w-full" />
        <div className="mx-auto mt-6 h-1 w-2/3 overflow-hidden rounded bg-blue-100"><div className="load-bar h-full" /></div>
      </div>
    </div>
  );
}
