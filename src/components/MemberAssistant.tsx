"use client";
import { useRef, useState } from "react";
type M = { role: "user" | "assistant"; content: string };
export default function MemberAssistant() {
  const [msgs, setMsgs] = useState<M[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  async function send(value = text) {
    const q = value.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const r = await fetch("/api/member/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const j = await r.json();
      setMsgs([...next, { role: "assistant", content: j.reply ?? "I'm here to help." }]);
      setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 0);
    } catch {
      setMsgs([...next, { role: "assistant", content: "I couldn't connect right now. Please try again." }]);
    } finally { setBusy(false); }
  }
  const ideas = ["What can I do as a member?", "What events are coming up?", "Help me find a beginner lesson"];
  return <section className="card mt-8 overflow-hidden !p-0">
    <div className="border-b border-blue/10 bg-gradient-to-r from-blue/10 to-gold/10 px-5 py-4"><p className="font-semibold text-blue">SPERART Member AI</p><p className="text-sm text-ink/60">Ask about your membership, events, academy, library or the website.</p></div>
    <div className="max-h-80 space-y-3 overflow-y-auto p-5">
      {!msgs.length && <div className="flex flex-wrap gap-2">{ideas.map((i) => <button key={i} type="button" onClick={() => send(i)} className="rounded-full border border-gold px-3 py-2 text-sm hover:shadow-[0_0_16px_rgba(255,201,60,.35)]">{i}</button>)}</div>}
      {msgs.map((m, i) => <div key={i} className={m.role === "user" ? "flex justify-end" : ""}><div className={`max-w-[90%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${m.role === "user" ? "bg-blue text-white" : "bg-bone"}`}>{m.content}</div></div>)}
      {busy && <p className="text-sm text-ink/50">Thinking…</p>}
      <div ref={end} />
    </div>
    <div className="flex gap-2 border-t border-blue/10 p-3"><input className="field" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask your member assistant…" /><button type="button" onClick={() => send()} disabled={busy} className="btn btn-blue !px-5">Send</button></div>
  </section>;
}
