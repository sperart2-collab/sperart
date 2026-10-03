"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { addHeroVideo } from "@/app/admin/actions";
type Item = { id: string; kind: string; path: string; title: string | null };
/** Upload to the public "media" bucket. Copy a link to use anywhere; videos can go straight into the hero. */
export default function MediaManager() {
  const sb = supabaseBrowser();
  const [items, setItems] = useState<Item[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const url = (p: string) => sb.storage.from("media").getPublicUrl(p).data.publicUrl;
  const load = async () => { const { data } = await sb.from("media").select("id,kind,path,title").order("created_at", { ascending: false }); setItems((data as Item[]) ?? []); };
  useEffect(() => { load(); }, []);
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setBusy(true); setMsg("");
    for (const f of files) {
      const kind = f.type.startsWith("video") ? "video" : f.type.startsWith("audio") ? "audio" : f.type.startsWith("image") ? "image" : "document";
      const path = `${kind}/${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await sb.storage.from("media").upload(path, f);
      if (error) { setMsg(`${f.name}: ${error.message}`); continue; }
      await sb.from("media").insert({ kind, bucket: "media", path, title: f.name });
    }
    setBusy(false); e.target.value = ""; load();
  }
  async function rename(i: Item) {
    const t = prompt("Title shown on the website", i.title ?? "");
    if (t === null) return;
    await sb.from("media").update({ title: t.trim() }).eq("id", i.id);
    load();
  }
  async function remove(i: Item) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    await sb.storage.from("media").remove([i.path]);
    await sb.from("media").delete().eq("id", i.id);
    load();
  }
  return (
    <>
      <label className="btn btn-blue mt-6 cursor-pointer">{busy ? "Uploading…" : "Upload files"}
        <input type="file" multiple hidden disabled={busy} onChange={upload} accept="image/*,video/*,audio/*,.pdf" />
      </label>
      <p className="mt-2 text-sm text-ink/60">Photos, videos, audio and PDFs. The free plan allows 50 MB per file.</p>
      {msg && <p role="alert" className="mt-3 text-sm">{msg}</p>}
      {!items.length && <p className="mt-8 text-ink/70">Nothing uploaded yet.</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <div key={i.id} className="card !p-3">
            {i.kind === "image" && <img src={url(i.path)} alt={i.title ?? ""} className="h-40 w-full rounded-lg object-cover" />}
            {i.kind === "video" && <video src={url(i.path)} controls preload="metadata" className="h-40 w-full rounded-lg bg-navy object-cover" />}
            {i.kind === "audio" && <audio src={url(i.path)} controls className="w-full" />}
            {i.kind === "document" && <a href={url(i.path)} target="_blank" className="block h-40 pt-16 text-center underline">Open file</a>}
            <p className="mt-2 truncate text-sm">{i.title}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <button className="underline" onClick={() => { navigator.clipboard.writeText(url(i.path)); setMsg("Link copied. Paste it in Edit content."); }}>Copy link</button>
              {i.kind === "video" && <button className="underline" onClick={async () => { await addHeroVideo(url(i.path)); setMsg("Added to the homepage hero."); }}>Add to hero</button>}
              <button className="underline" onClick={() => rename(i)}>Rename</button>
              <button className="text-red-600 underline" onClick={() => remove(i)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
