import { supabaseServer } from "@/lib/supabase/server";
import { setMemberStatus } from "../records";
import SubmitButton from "@/components/SubmitButton";
export const dynamic = "force-dynamic";
export default async function Members({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const { data } = await supabaseServer().from("profiles").select("*").order("created_at", { ascending: false });
  return <>
    <h1 className="text-3xl font-semibold">Members</h1>
    <p className="mt-2 text-ink/60">Approve, deactivate and manage every SPERART member from one place.</p>
    {searchParams.ok && <p role="status" className="mt-4 rounded-xl border border-gold bg-white p-3">Member updated successfully.</p>}
    {searchParams.error && <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-white p-3">{searchParams.error}</p>}
    {!data?.length && <p className="mt-6 text-ink/70">No members yet.</p>}
    <div className="mt-6 space-y-3">
      {data?.map((m) => <div key={m.user_id} className="card flex flex-wrap items-center justify-between gap-4 !p-4">
        <div className="min-w-0"><p className="font-semibold">{m.full_name || "(no name yet)"} <span className="font-normal text-ink/60">{m.email}</span></p><p className="mt-1 text-sm text-ink/70">{m.membership_type || "No type chosen"} · {m.phone || "no phone"}</p><p className={`mt-1 text-sm font-semibold ${m.status === "active" ? "text-blue" : m.status === "pending" ? "text-ink" : "text-red-600"}`}>{m.status === "active" ? "Active member" : m.status === "pending" ? "Pending approval" : "Inactive"}</p></div>
        <div className="flex gap-2">
          {m.status !== "active" && <form action={setMemberStatus}><input type="hidden" name="uid" value={m.user_id} /><input type="hidden" name="status" value="active" /><SubmitButton className="btn btn-blue !px-4 !py-2" pending="Approving…">Approve</SubmitButton></form>}
          {m.status === "active" && <form action={setMemberStatus}><input type="hidden" name="uid" value={m.user_id} /><input type="hidden" name="status" value="inactive" /><SubmitButton className="btn border border-gold !px-4 !py-2" pending="Deactivating…">Deactivate</SubmitButton></form>}
        </div>
      </div>)}
    </div>
  </>;
}
