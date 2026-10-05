import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
import { fmt } from "@/lib/format";
import { getSettings, lines, cols } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = { title: "Events", description: "Performances, workshops and gatherings from the Society of Percussive Art." };
type Ev = { slug: string; title: string; location: string | null; cover_url: string | null; starts_at: string };
const List = ({ items }: { items: Ev[] }) => (
  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((e) => (
      <a key={e.slug} href={`/events/${e.slug}`} className="card block !p-0 overflow-hidden">
        {e.cover_url && <img src={e.cover_url} alt="" className="h-44 w-full object-cover" />}
        <div className="p-5"><p className="text-sm text-blue">{fmt(e.starts_at)}</p><h3 className="mt-1 text-xl font-semibold">{e.title}</h3><p className="mt-1 text-ink/70">{e.location}</p></div>
      </a>
    ))}
  </div>
);
export default async function Events() {
  const { data } = await supabaseServer().from("events").select("slug,title,location,cover_url,starts_at").eq("status", "published").order("starts_at");
  const s = await getSettings();
  const now = Date.now(), all = (data ?? []) as Ev[];
  const up = all.filter((e) => new Date(e.starts_at).getTime() >= now), past = all.filter((e) => new Date(e.starts_at).getTime() < now).reverse();
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Events</h1>
      <h2 className="mt-10 text-2xl font-semibold">Upcoming</h2>
      {up.length ? <List items={up} /> : <p className="mt-4 text-ink/70">No upcoming events yet.</p>}
      {past.length > 0 && (<><h2 className="mt-14 text-2xl font-semibold">Past events</h2><List items={past} /></>)}
      {lines(s.faq.items).length > 0 && (
        <section className="mt-16"><h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          {lines(s.faq.items).map((l, i) => { const [q, a] = cols(l); return <details key={i} className="card mt-3"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-ink/75">{a}</p></details>; })}
        </section>
      )}
    </Shell>
  );
}
