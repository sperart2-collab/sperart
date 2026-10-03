import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "News", description: "News and announcements from the Society of Percussive Art." };
export default async function News() {
  const { data } = await supabaseServer().from("articles").select("slug,title,excerpt,cover_url,created_at").eq("status", "published").order("created_at", { ascending: false });
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">News</h1>
      {!data?.length && <p className="mt-8 text-ink/70">No news yet. Check back soon.</p>}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((a) => (
          <a key={a.slug} href={`/news/${a.slug}`} className="card block !p-0 overflow-hidden">
            {a.cover_url && <img src={a.cover_url} alt="" className="h-44 w-full object-cover" />}
            <div className="p-5"><p className="text-sm text-ink/60">{new Date(a.created_at).toLocaleDateString("en-NG", { dateStyle: "long" })}</p>
              <h2 className="mt-1 text-xl font-semibold text-blue">{a.title}</h2><p className="mt-2 text-ink/75">{a.excerpt}</p></div>
          </a>
        ))}
      </div>
    </Shell>
  );
}
