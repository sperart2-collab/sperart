import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Registrations() {
  const { data } = await supabaseServer().from("registrations").select("*, events(title)").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <h1 className="text-3xl font-semibold">Event registrations</h1>
      {!data?.length && <p className="mt-6 text-ink/70">No registrations yet.</p>}
      <div className="mt-6 space-y-3">
        {data?.map((r) => (
          <div key={r.id} className="card !p-4"><p className="font-semibold">{r.name}</p>
            <p className="text-sm text-ink/70">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
            <p className="mt-1 text-sm text-blue">{r.events?.title}</p></div>
        ))}
      </div>
    </>
  );
}
