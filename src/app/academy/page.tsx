import Shell from "@/components/Shell";
import Metronome from "@/components/Metronome";
import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Academy", description: "Percussion lessons and rudiments from beginner to advanced, with video, audio and a practice metronome." };
type L = { slug: string; title: string; summary: string | null; level: string; category: string };
export default async function Academy() {
  const { data } = await supabaseServer().from("lessons").select("slug,title,summary,level,category").eq("status", "published").order("created_at");
  const all = (data ?? []) as L[];
  return (
    <Shell>
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-blue">SPERART Academy</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Learn the language of rhythm.</h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">A structured percussion curriculum covering technique, rhythm reading, rudiments, ensemble playing, improvisation and Nigerian and wider African drum traditions.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[["Djembe & hand percussion", "Technique, tone, bass, slap, accompaniment and ensemble control."], ["Gongo & talking-drum traditions", "Pitch, tension, phrase, call-and-response and musical language, taught with respect for local terminology and practice."], ["Bàtá, dùndún & drum families", "Explore the roles, sounds and ensemble thinking behind Nigerian drum traditions."]].map(([title, body]) => <article key={title} className="card"><h2 className="font-semibold text-blue">{title}</h2><p className="mt-2 text-sm leading-6 text-ink/70">{body}</p></article>)}
      </div>
      <div className="mt-8 max-w-xl"><Metronome /></div>
      {!all.length && <p className="mt-12 text-ink/70">Your curriculum is being prepared in the Academy editor.</p>}
      {[["Rudiment", "Rudiments"], ["Lesson", "Lessons"]].map(([cat, label]) => {
        const items = all.filter((l) => l.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat} className="mt-14">
            <h2 className="text-3xl font-semibold">{label}</h2>
            {["Beginner", "Intermediate", "Advanced"].map((lv) => {
              const g = items.filter((l) => l.level === lv);
              return g.length ? (
                <div key={lv} className="mt-6"><h3 className="text-lg font-semibold text-blue">{lv}</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {g.map((l) => <a key={l.slug} href={`/academy/${l.slug}`} className="card block"><h4 className="font-semibold">{l.title}</h4><p className="mt-1 text-sm text-ink/70">{l.summary}</p></a>)}
                  </div></div>
              ) : null;
            })}
          </section>
        );
      })}
    </Shell>
  );
}
