import { supabaseServer } from "@/lib/supabase/server";
import { markHandled } from "../actions";
export const dynamic = "force-dynamic";
export default async function Inbox() {
  const { data } = await supabaseServer().from("inquiries").select("*").order("created_at", { ascending: false }).limit(100);
  return (
    <>
      <h1 className="text-3xl font-semibold">Messages</h1>
      {!data?.length && <p className="mt-6 text-ink/70">No messages yet. Questions Spar passes on appear here.</p>}
      <div className="mt-6 space-y-4">
        {data?.map((m) => (
          <article key={m.id} className="card">
            <p className="font-semibold">{m.name} <span className="font-normal text-ink/60">{m.email}</span></p>
            <p className="mt-2 whitespace-pre-line">{m.message}</p>
            <p className="mt-3 text-sm text-ink/60">{new Date(m.created_at).toLocaleString()} · {m.status === "new" ? "New" : "Handled"}</p>
            <div className="mt-3 flex gap-3">
              <a className="btn btn-blue !px-4 !py-2" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to SPERART")}`}>Reply by email</a>
              {m.status === "new" && <form action={markHandled}><input type="hidden" name="id" value={m.id} /><button className="btn border border-gold !px-4 !py-2">Mark handled</button></form>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
