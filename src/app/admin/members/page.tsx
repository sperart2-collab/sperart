import { supabaseServer } from "@/lib/supabase/server";
import { setMemberStatus } from "../records";
export const dynamic = "force-dynamic";
export default async function Members({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const { data } = await supabaseServer().from("profiles").select("*").order("created_at", { ascending: false });
  return (
    <>
      <h1 className="text-3xl font-semibold">Members</h1>
      {searchParams.ok && <p role="status" className="mt-4 rounded-xl border border-gold bg-white p-3">Member updated.</p>}
      {searchParams.error && <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-white p-3">{searchParams.error}</p>}
      {!data?.length && <p className="mt-6 text-ink/70">No members yet.</p>}
      <div className="mt-6 space-y-3">
        {data?.map((m) => (
          <div key={m.user_id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
            <div><p className="font-semibold">{m.full_name || "(no name yet)"} <span className="font-normal text-ink/60">{m.email}</span></p>
              <p className="text-sm text-ink/70">{m.membership_type || "No type chosen"} · {m.phone || "no phone"} · <strong>{m.status}</strong></p></div>
            <div className="flex gap-2">
              {[["active", "Approve", "btn btn-blue"], ["inactive", "Deactivate", "btn border border-gold"]].map(([s, l, c]) => (
                <form key={s} action={setMemberStatus}><input type="hidden" name="uid" value={m.user_id} /><input type="hidden" name="status" value={s} /><button className={`${c} !px-4 !py-2`}>{l}</button></form>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
