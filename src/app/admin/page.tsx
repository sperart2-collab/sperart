import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
async function count(table: string, status?: string) {
  let q = supabaseServer().from(table).select("*", { count: "exact", head: true });
  if (status) q = q.eq("status", status);
  return (await q).count ?? 0;
}
const quick = [["Upload media", "/admin/media"], ["Add news", "/admin/manage/news"], ["Create event", "/admin/manage/events"], ["Create lesson", "/admin/manage/lessons"], ["Review messages", "/admin/inbox"], ["Ask the AI assistant", "/admin/assistant"]];
export default async function AdminHome() {
  const [msgs, pending, regs, subs, news, drafts, media] = await Promise.all([count("inquiries", "new"), count("profiles", "pending"), count("registrations"), count("subscribers"), count("articles", "published"), count("articles", "draft"), count("media")]);
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Africa/Lagos" }));
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const stats: [string, number][] = [["New messages", msgs], ["Members to approve", pending], ["Event registrations", regs], ["Subscribers", subs], ["Published news", news], ["Draft articles", drafts], ["Media files", media]];
  const { data: recent } = await supabaseServer().from("inquiries").select("id,name,message,status").order("created_at", { ascending: false }).limit(3);
  return (
    <>
      <h1 className="text-4xl font-semibold tracking-tight">{greet}.</h1>
      <p className="mt-1 text-ink/70">Here is what is happening at SPERART.</p>
      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([k, v]) => <div key={k} className="card"><dd className="neon-blue text-4xl font-semibold">{v}</dd><dt className="mt-1 text-sm text-ink/70">{k}</dt></div>)}
      </dl>
      <h2 className="mt-12 text-xl font-semibold">Quick actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        {quick.map(([t, h]) => <a key={h} href={h} className="card text-center font-medium">{t}</a>)}
      </div>
      <h2 className="mt-12 text-xl font-semibold">Latest messages</h2>
      {!recent?.length && <p className="mt-3 text-ink/70">No messages yet.</p>}
      <div className="mt-4 space-y-3">{recent?.map((m) => <a key={m.id} href="/admin/inbox" className="card block !p-4"><p className="font-semibold">{m.name} {m.status === "new" && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs text-navy">New</span>}</p><p className="truncate text-sm text-ink/70">{m.message}</p></a>)}</div>
    </>
  );
}
