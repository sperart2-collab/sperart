"use client";
import { useEffect, useRef, useState } from "react";
/** Practice metronome using Web Audio with look-ahead scheduling for steady timing. */
export default function Metronome() {
  const [bpm, setBpm] = useState(90);
  const [beats, setBeats] = useState(4);
  const [on, setOn] = useState(false);
  const [beat, setBeat] = useState(-1);
  const ctx = useRef<AudioContext | null>(null);
  const bpmRef = useRef(bpm), beatsRef = useRef(beats);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { beatsRef.current = beats; }, [beats]);
  useEffect(() => {
    if (!on) { setBeat(-1); return; }
    if (!ctx.current) ctx.current = new AudioContext();
    const ac = ctx.current;
    ac.resume();
    let next = ac.currentTime + 0.05, n = 0;
    const tick = () => {
      while (next < ac.currentTime + 0.15) {
        const b = n % beatsRef.current, o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = b === 0 ? 1200 : 800;
        g.gain.setValueAtTime(0.4, next); g.gain.exponentialRampToValueAtTime(0.001, next + 0.06);
        o.connect(g); g.connect(ac.destination); o.start(next); o.stop(next + 0.07);
        setTimeout(() => setBeat(b), Math.max(0, (next - ac.currentTime) * 1000));
        next += 60 / bpmRef.current; n++;
      }
    };
    tick();
    const id = setInterval(tick, 25);
    return () => clearInterval(id);
  }, [on]);
  return (
    <section className="card" aria-label="Metronome">
      <h2 className="text-xl font-semibold text-blue">Practice metronome</h2>
      <p className="mt-3 text-5xl font-semibold">{bpm} <span className="text-lg font-normal text-ink/60">BPM</span></p>
      <div className="mt-3 flex items-center gap-3">
        <button className="btn border border-gold !px-4 !py-2" onClick={() => setBpm((b) => Math.max(40, b - 1))} aria-label="Slower">−</button>
        <input type="range" min={40} max={220} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full accent-[#1E5BFF]" aria-label="Tempo" />
        <button className="btn border border-gold !px-4 !py-2" onClick={() => setBpm((b) => Math.min(220, b + 1))} aria-label="Faster">+</button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="text-sm">Beats <select value={beats} onChange={(e) => setBeats(+e.target.value)} className="field !w-auto !py-1">{[2, 3, 4, 5, 6, 7].map((b) => <option key={b}>{b}</option>)}</select></label>
        <div className="flex gap-2" aria-hidden>{Array.from({ length: beats }, (_, i) => <span key={i} className={`h-4 w-4 rounded-full transition ${beat === i ? "bg-gold shadow-[0_0_12px_#FFC93C]" : "bg-clay"}`} />)}</div>
        <button className="btn btn-blue ml-auto" onClick={() => setOn(!on)}>{on ? "Stop" : "Start"}</button>
      </div>
    </section>
  );
}
