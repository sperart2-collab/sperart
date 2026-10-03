import { supabaseServer } from "@/lib/supabase/server";
async function count(table: string, status?: string) {
  let q = supabaseServer().from(table).select("*", { count: "exact", head: true });
  if (status) q = q.eq("status", status);
  return (await q).count ?? 0;
}
export default async function AdminHome() {
  const [published, drafts, media, inquiries] = await Promise.all([count("articles", "published"), count("articles", "draft"), count("media"), count("inquiries", "new")]);
  const stats = [["Published articles", published], ["Drafts", drafts], ["Media files", media], ["New messages for you", inquiries]];
  return (
    <>
      <h1 className="text-4xl font-semibold">Good day.</h1>
      <p className="mt-1 text-ink/70">SPERART overview</p>
      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([k, v]) => <div key={k as string} className="card"><dd className="text-3xl font-semibold text-blue">{v}</dd><dt className="mt-1 text-sm text-ink/70">{k}</dt></div>)}
      </dl>
      <p className="mt-10 text-sm text-ink/60">Upload tools, editors and the message inbox are the next phase.</p>
    </>
  );
}
