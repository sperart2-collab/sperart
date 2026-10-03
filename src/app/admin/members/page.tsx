import { supabaseServer } from "@/lib/supabase/server";
import { setMemberStatus } from "../records";
export const dynamic = "force-dynamic";
export default async function Members() {
  const { data } = await supabaseServer().from("profiles").select("*").order("created_at", { ascending: false });
  return (
    <>
      <h1 className="text-3xl font-semibold">Members</h1>
      {!data?.length && <p className="mt-6 text-ink/70">No members yet.</p>}
      <div className="mt-6 space-y-3">
        {data?.map((m) => (
          <div key={m.user_id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
            <div><p className="font-semibold">{m.full_name || "(no name yet)"} <span className="font-normal text-ink/60">{m.email}</span></p>
              <p className="text-sm text-ink/70">{m.membership_type || "No type chosen"} · {m.phone || "no phone"} · <strong>{m.status}</strong></p></div>
            <form action={setMemberStatus} className="flex gap-2"><input type="hidden" name="uid" value={m.user_id} />
              <button name="status" value="active" className="btn btn-blue !px-4 !py-2">Approve</button>
              <button name="status" value="inactive" className="btn border border-gold !px-4 !py-2">Deactivate</button></form>
          </div>
        ))}
      </div>
    </>
  );
}
