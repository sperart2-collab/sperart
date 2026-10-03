import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Library", description: "Articles, research, publications and educational resources from the Society of Percussive Art." };
const cats = ["Article", "Research", "Publication", "Educational resource", "Archive"];
export default async function Library({ searchParams }: { searchParams: { q?: string; cat?: string } }) {
  const term = (searchParams.q ?? "").replace(/[%,()]/g, "").trim().slice(0, 60);
  let q = supabaseServer().from("resources").select("*").eq("status", "published").order("created_at", { ascending: false });
  if (term) q = q.or(`title.ilike.%${term}%,summary.ilike.%${term}%,tags.ilike.%${term}%`);
  if (searchParams.cat) q = q.eq("category", searchParams.cat);
  const { data } = await q;
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Library</h1>
      <form className="mt-8 flex flex-wrap gap-3">
        <input name="q" defaultValue={term} placeholder="Search the library" className="field max-w-sm" aria-label="Search" />
        <select name="cat" defaultValue={searchParams.cat ?? ""} className="field !w-auto" aria-label="Type"><option value="">All types</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn btn-blue">Search</button>
      </form>
      {!data?.length && <p className="mt-10 text-ink/70">Nothing found.</p>}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {data?.map((r) => (
          <article key={r.id} className="card">
            <p className="text-sm text-blue">{r.category}</p><h2 className="mt-1 text-xl font-semibold">{r.title}</h2>
            <p className="mt-2 text-ink/75">{r.summary}</p>
            {r.tags && <p className="mt-2 text-sm text-ink/60">{r.tags}</p>}
            {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-blue mt-4 !px-5 !py-2">Open</a>}
          </article>
        ))}
      </div>
    </Shell>
  );
}
