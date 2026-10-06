"use client";
import { useRef, useState } from "react";
type M = { role: "user" | "assistant"; content: string };
export default function MemberAI() {
  const [messages, setMessages] = useState<M[]>([{ role: "assistant", content: "Hi — I’m your SPERART assistant. Ask me about your membership, events, Academy lessons, the library, or anything on the site." }]);
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false); const end = useRef<HTMLDivElement>(null);
  async function send(value = text) {
    if (!value.trim() || busy) return; const next = [...messages, { role: "user" as const, content: value.trim() }]; setMessages(next); setText(""); setBusy(true);
    try { const r = await fetch("/api/member/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next }) }); const j = await r.json(); setMessages([...next, { role: "assistant", content: j.reply || "I’m here. Try asking me another way." }]); }
    catch { setMessages([...next, { role: "assistant", content: "I’m having trouble connecting right now. Please try again in a moment." }]); }
    setBusy(false); setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }
  return <section className="overflow-hidden rounded-[28px] border border-blue/10 bg-white shadow-[0_18px_60px_rgba(15,82,255,.12)]">
    <div className="flex items-center justify-between bg-[linear-gradient(135deg,#06122E,#0F52FF)] px-5 py-4 text-white"><div className="flex items-center gap-3"><span className="grid h-10 w-10 overflow-hidden rounded-2xl border border-gold/40 bg-navy shadow-[0_0_22px_rgba(255,201,60,.35)]"><img src="/emblem.png" alt="SPERART" className="h-full w-full object-cover" /></span><div><p className="font-semibold">SPERART AI</p><p className="text-xs text-white/60">Your personal rhythm guide</p></div></div><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">Online</span></div>
    <div className="h-[24rem] space-y-3 overflow-y-auto bg-bone/30 p-4">{messages.map((m,i)=><div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "bg-blue text-white" : "border border-blue/10 bg-white"}`}>{m.content}</div></div>)}{busy && <div className="text-sm text-ink/50">Thinking…</div>}<div ref={end}/></div>
    <div className="border-t border-blue/10 p-3"><div className="flex gap-2"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key === "Enter" && send()} className="field" placeholder="Ask SPERART AI…"/><button onClick={()=>send()} className="btn btn-blue !px-5">Ask</button></div><div className="mt-2 flex flex-wrap gap-2">{["What events are coming up?","Help me find a beginner lesson","What is my membership status?"].map(q=><button key={q} onClick={()=>send(q)} className="rounded-full border border-blue/15 px-3 py-1.5 text-xs hover:border-blue/40">{q}</button>)}</div></div>
  </section>;
}
