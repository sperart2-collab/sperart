"use client";
import { useRef, useEffect, useState } from "react";
import { createDraft } from "@/app/admin/records";
type M = { role: "user" | "assistant"; content: string };
type D = { type: string; title?: string; summary?: string; body?: string; location?: string; level?: string; category?: string };
const ideas = ["Write an announcement for our percussion workshop", "Create a beginner rhythm lesson", "What should I publish this week?"];
/** AI suggests, admin reviews and edits the draft, admin approves: it is saved as an unpublished draft only. */
export default function AdminAssistant() {
  const [msgs, setMsgs] = useState<M[]>([]);
  const [draft, setDraft] = useState<D | null>(null);
  const [n, setN] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, draft]);
  async function send(t: string) {
    if (!t.trim() || busy) return;
    const next: M[] = [...msgs, { role: "user", content: t }];
    setMsgs(next); setText(""); setBusy(true); setDraft(null);
    try {
      const r = await fetch("/api/admin/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const j = await r.json();
      setMsgs([...next, { role: "assistant", content: j.reply ?? "Done." }]);
      if (j.draft && ["news", "events", "lessons"].includes(j.draft.type)) { setDraft(j.draft); setN((x) => x + 1); }
    } catch { setMsgs([...next, { role: "assistant", content: "Could not reach the assistant." }]); }
    setBusy(false);
  }
  return (
    <div className="mt-6 space-y-4">
      {!msgs.length && <div className="flex flex-wrap gap-2">{ideas.map((i) => <button key={i} onClick={() => send(i)} className="btn border border-gold !px-4 !py-2 text-sm">{i}</button>)}</div>}
      <div className="space-y-3">{msgs.map((m, i) => <p key={i} className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2 ${m.role === "user" ? "ml-auto bg-blue text-white" : "bg-white"}`}>{m.content}</p>)}{busy && <p className="text-ink/60">Thinking…</p>}</div>
      {draft && (
        <form key={n} action={createDraft} className="card space-y-3">
          <h2 className="text-xl font-semibold text-blue">Review the draft ({draft.type})</h2>
          <input type="hidden" name="type" value={draft.type} />
          <label className="block text-sm">Title<input name="title" defaultValue={draft.title} className="field mt-1" /></label>
          {draft.type !== "events" && <label className="block text-sm">Summary<textarea name="summary" defaultValue={draft.summary} rows={2} className="field mt-1" /></label>}
          <label className="block text-sm">Text<textarea name="body" defaultValue={draft.body} rows={9} className="field mt-1" /></label>
          {draft.type === "events" && <><label className="block text-sm">Location<input name="location" defaultValue={draft.location} className="field mt-1" /></label><label className="block text-sm">Date and time (Lagos)<input name="starts_at" type="datetime-local" className="field mt-1" /></label></>}
          {draft.type === "lessons" && <div className="flex gap-3"><input type="hidden" name="level" value={draft.level ?? "Beginner"} /><input type="hidden" name="category" value={draft.category ?? "Lesson"} /><p className="text-sm text-ink/70">{draft.category ?? "Lesson"} · {draft.level ?? "Beginner"}</p></div>}
          <button className="btn btn-blue">Approve and save as draft</button>
          <p className="text-sm text-ink/60">It is saved unpublished. You can edit and publish it from its page in the admin.</p>
        </form>
      )}
      <div ref={end} />
      <div className="sticky bottom-3 flex gap-2 rounded-2xl bg-white p-2 shadow-lg">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(text)} placeholder="Ask the assistant…" className="field" aria-label="Message" />
        <button onClick={() => send(text)} className="btn btn-blue !px-5">Send</button>
      </div>
    </div>
  );
}
