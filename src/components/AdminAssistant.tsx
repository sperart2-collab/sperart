"use client";
import { useEffect, useRef, useState } from "react";
import { runActions, type Action } from "@/app/admin/agent";
import { supabaseBrowser } from "@/lib/supabase/browser";
type M = { role: "user" | "assistant"; content: string; pending?: Action[]; results?: string[] };
const ideas = ["What needs my attention?", "Write an announcement for our percussion workshop", "Create a beginner rhythm lesson", "Approve all pending members"];
const label = (a: Action) => `${a.type.replace(/_/g, " ")}: ${a.args?.title ?? a.args?.email ?? a.args?.field ?? a.args?.kind ?? a.args?.id ?? ""}`;
/** Chat-style digital admin. Ask-first by default; Full control lets it run actions itself (deletes still need your approval). */
export default function AdminAssistant() {
  const [msgs, setMsgs] = useState<M[]>([]);
  const [text, setText] = useState(""), [busy, setBusy] = useState(false), [full, setFull] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { setFull(localStorage.getItem("sp-ai-full") === "1"); }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);
  const toggle = () => { const v = !full; setFull(v); localStorage.setItem("sp-ai-full", v ? "1" : "0"); };
  async function send(t: string) {
    if (!t.trim() || busy) return;
    const next: M[] = [...msgs, { role: "user", content: t }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const r = await fetch("/api/admin/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }) });
      const j = await r.json();
      const acts: Action[] = j.actions ?? [];
      const safe = full ? acts.filter((a) => a.type !== "delete_item") : [];
      const pending = acts.filter((a) => !safe.includes(a));
      const results = safe.length ? await runActions(safe, true) : undefined;
      setMsgs([...next, { role: "assistant", content: j.reply ?? j.error ?? "Done.", pending: pending.length ? pending : undefined, results }]);
    } catch { setMsgs([...next, { role: "assistant", content: "Could not reach the assistant. Check your connection." }]); }
    setBusy(false);
  }
  async function decide(i: number, approve: boolean) {
    const m = msgs[i]; if (!m.pending) return;
    const results = approve ? await runActions(m.pending, false) : ["Rejected. Nothing was changed."];
    setMsgs((all) => all.map((x, n) => (n === i ? { ...x, pending: undefined, results: [...(x.results ?? []), ...results] } : x)));
  }
  async function attach(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    const sb = supabaseBrowser(), names: string[] = [];
    for (const f of files) {
      const kind = f.type.startsWith("video") ? "video" : f.type.startsWith("audio") ? "audio" : f.type.startsWith("image") ? "image" : "document";
      const path = `${kind}/${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await sb.storage.from("media").upload(path, f);
      if (!error) { await sb.from("media").insert({ kind, bucket: "media", path, title: f.name }); names.push(`${kind} "${f.name}"`); }
    }
    e.target.value = "";
    if (names.length) send(`I uploaded to Media: ${names.join(", ")}. ${text || "Tell me where you suggest using them."}`);
  }
  return (
    <div className="mt-5 flex h-[calc(100dvh-12rem)] min-h-[26rem] flex-col rounded-3xl border border-blue/20 bg-white shadow-[0_0_40px_rgba(15,82,255,.1)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue/10 px-4 py-3">
        <p className="font-semibold">Digital admin <span className="ml-1 text-sm font-normal text-ink/60">{full ? "Full control is ON" : "Ask first"}</span></p>
        <button role="switch" aria-checked={full} onClick={toggle} className="flex items-center gap-2 text-sm"><span>Full control</span>
          <span className={`h-6 w-11 rounded-full p-0.5 transition ${full ? "bg-blue shadow-[0_0_12px_#0F52FF]" : "bg-clay"}`}><span className={`block h-5 w-5 rounded-full bg-white shadow transition ${full ? "translate-x-5" : ""}`} /></span></button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!msgs.length && <div><p className="text-ink/70">I can monitor the site, write drafts, approve members, update content and use your uploaded media. {full ? "Full control is on: I will do safe tasks myself and ask before deleting." : "I will ask before changing anything."}</p>
          <div className="mt-4 flex flex-wrap gap-2">{ideas.map((i) => <button key={i} onClick={() => send(i)} className="btn border border-gold !px-4 !py-2 text-sm">{i}</button>)}</div></div>}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[88%] space-y-2 rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-blue text-white" : "bg-bone"}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.results?.map((r, n) => <p key={n} className="rounded-lg bg-white/70 px-3 py-1 text-sm text-ink">✓ {r}</p>)}
              {m.pending && (<div className="rounded-xl border border-gold bg-white p-3 text-sm text-ink"><p className="font-semibold">Waiting for your approval</p>
                <ul className="mt-1 list-disc pl-5">{m.pending.map((a, n) => <li key={n}>{label(a)}</li>)}</ul>
                <div className="mt-3 flex gap-2"><button onClick={() => decide(i, true)} className="btn btn-blue !px-4 !py-2">Approve</button><button onClick={() => decide(i, false)} className="btn border border-gold !px-4 !py-2">Reject</button></div></div>)}
            </div>
          </div>
        ))}
        {busy && <p className="text-ink/60">Thinking…</p>}
        <div ref={end} />
      </div>
      <div className="flex items-center gap-2 border-t border-blue/10 p-3">
        <label className="btn cursor-pointer border border-gold !px-3 !py-2" title="Upload photos or videos">＋<input type="file" multiple hidden onChange={attach} accept="image/*,video/*,audio/*,.pdf" /></label>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(text)} placeholder="Message your digital admin…" className="field" aria-label="Message" />
        <button onClick={() => send(text)} className="btn btn-blue !px-5">Send</button>
      </div>
    </div>
  );
}
