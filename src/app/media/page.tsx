import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
import { storage } from "@/lib/storage";
export const dynamic = "force-dynamic";
export const metadata = { title: "Media", description: "Performances, photos and recordings from the Society of Percussive Art." };
type M = { id: string; kind: string; path: string; title: string | null };
export default async function Media() {
  const { data } = await supabaseServer().from("media").select("id,kind,path,title").order("created_at", { ascending: false });
  const all = (data ?? []) as M[];
  const videos = all.filter((m) => m.kind === "video"), photos = all.filter((m) => m.kind === "image"), audio = all.filter((m) => m.kind === "audio");
  const u = (p: string) => storage.publicUrl("media", p);
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Media</h1>
      <p className="mt-3 text-ink/70">Performances, photos and recordings.</p>
      {!all.length && <p className="mt-10 text-ink/70">Nothing here yet.</p>}
      {videos.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Performances</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, i) => (
              <div key={v.id} className="card !p-3">
                <video src={`${u(v.path)}#t=0.5`} controls playsInline preload={i < 9 ? "metadata" : "none"} className="aspect-[4/5] w-full rounded-lg bg-navy object-contain" />
                <p className="mt-2 truncate">{v.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {photos.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Photos</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((p) => <img key={p.id} src={u(p.path)} alt={p.title ?? ""} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />)}
          </div>
        </section>
      )}
      {audio.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Audio</h2>
          <div className="mt-6 space-y-3">{audio.map((a) => <div key={a.id} className="card !p-4"><p className="mb-2">{a.title}</p><audio src={u(a.path)} controls preload="none" className="w-full" /></div>)}</div>
        </section>
      )}
    </Shell>
  );
}
