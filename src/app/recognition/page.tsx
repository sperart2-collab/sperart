import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Recognition", description: "Awards, honours, competitions, scholarships and featured artists of the Society of Percussive Art." };
const groups: [string, string][] = [["Featured Artist", "Featured artists"], ["Award", "Awards"], ["Honour", "Honours"], ["Competition", "Competitions"], ["Scholarship", "Scholarships"]];
export default async function Recognition() {
  const { data } = await supabaseServer().from("recognitions").select("*").eq("status", "published").order("created_at", { ascending: false });
  const all = data ?? [];
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Recognition</h1>
      {!all.length && <p className="mt-8 text-ink/70">Nothing here yet.</p>}
      {groups.map(([cat, label]) => {
        const items = all.filter((r) => r.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat} className="mt-12"><h2 className="text-2xl font-semibold">{label}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((r) => (
                <article key={r.id} className="card !p-0 overflow-hidden">
                  {r.image_url && <img src={r.image_url} alt="" loading="lazy" className="h-48 w-full object-cover" />}
                  <div className="p-5"><h3 className="text-lg font-semibold text-blue">{r.title}</h3>{r.year && <p className="text-sm text-ink/60">{r.year}</p>}<p className="mt-2 whitespace-pre-line text-ink/75">{r.summary}</p></div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </Shell>
  );
}
