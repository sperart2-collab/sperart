"use client";
import { useEffect, useState } from "react";
export default function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  if (now === null) return null;
  const s = Math.floor(Math.max(0, new Date(to).getTime() - now) / 1000);
  const parts: [string, number][] = [["Days", Math.floor(s / 86400)], ["Hours", Math.floor((s % 86400) / 3600)], ["Min", Math.floor((s % 3600) / 60)], ["Sec", s % 60]];
  return <div className="flex gap-3" aria-label="Countdown to the event">{parts.map(([l, v]) => <div key={l} className="card min-w-[4.2rem] !p-3 text-center"><p className="text-2xl font-semibold text-blue">{String(v).padStart(2, "0")}</p><p className="text-xs text-ink/60">{l}</p></div>)}</div>;
}
