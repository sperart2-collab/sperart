"use client";
import { useEffect, useRef, useState } from "react";
type M = { role: "user" | "assistant"; content: string };
const TOKEN = "[[ESCALATE]]";
/** Spar: site assistant. Answers questions; hands over to the admin via a message form when needed. */
export default function Spar() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<M[]>([{ role: "assistant", content: "Hi, I'm Spar. Ask me anything about SPERART." }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [esc, setEsc] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = (e: Event) => { if ((e.target as HTMLElement).closest("[data-open-spar]")) setOpen(true); };
    document.addEventListener("click", f);
    return () => document.removeEventListener("click", f);
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, esc, open]);
  async function send() {
    const t = text.trim();
    if (!t || busy) return;
    const next: M[] = [...msgs, { role: "user", content: t }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const r = await fetch("/api/spar", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.slice(1) }) });
      const { reply } = await r.json();
      setMsgs([...next, { role: "assistant", content: String(reply).replace(TOKEN, "").trim() }]);
      if (String(reply).includes(TOKEN)) setEsc(true);
    } catch { setMsgs([...next, { role: "assistant", content: "I couldn't connect. Please try again." }]); }
    setBusy(false);
  }
  async function contact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = JSON.stringify({ name: f.get("name"), email: f.get("email"), message: f.get("message") });
    const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body });
    if (r.ok) { setEsc(false); setMsgs((m) => [...m, { role: "assistant", content: "Sent. The admin will reply to your email." }]); }
    else setMsgs((m) => [...m, { role: "assistant", content: "That didn't send. Check your email address and try again." }]);
  }
  const lastUser = [...msgs].reverse().find((m) => m.role === "user")?.content ?? "";
  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Chat with Spar" className="btn btn-blue fixed bottom-5 right-5 z-[80] !h-14 !w-14 !rounded-full !p-0 text-sm">{open ? "✕" : "Spar"}</button>
      {open && (
        <section className="fixed inset-x-3 bottom-24 z-[80] flex h-[70vh] max-h-[34rem] flex-col overflow-hidden rounded-2xl border border-blue/20 bg-white shadow-2xl md:inset-x-auto md:right-5 md:w-96">
          <div className="flex items-center gap-2 bg-navy px-4 py-3 text-white"><span className="h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_10px_#FFC93C]" /><strong>Spar</strong><span className="text-sm text-white/60">SPERART assistant</span></div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {msgs.map((m, i) => <p key={i} className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.role === "user" ? "ml-auto bg-blue text-white" : "bg-bone"}`}>{m.content}</p>)}
            {busy && <p className="text-ink/50">Spar is typing…</p>}
            {esc && (
              <form onSubmit={contact} className="space-y-2 rounded-xl border border-gold p-3">
                <p className="font-medium">Send this to the admin</p>
                <input name="name" required placeholder="Your name" className="field !py-2" />
                <input name="email" type="email" required placeholder="Your email" className="field !py-2" />
                <textarea name="message" required defaultValue={lastUser} rows={3} className="field !py-2" />
                <button className="btn btn-blue w-full !py-2">Send to admin</button>
              </form>
            )}
            <div ref={end} />
          </div>
          <div className="flex gap-2 border-t border-bone p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} maxLength={500} placeholder="Ask a question" className="field !py-2" />
            <button onClick={send} className="btn btn-blue !px-4 !py-2">Send</button>
          </div>
        </section>
      )}
    </>
  );
}
