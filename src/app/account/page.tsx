import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
import { getSettings, lines, cols } from "@/lib/settings";
import { saveProfile } from "./actions";
import { signOut } from "../admin/actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };
const label: Record<string, string> = { pending: "Pending approval", active: "Active member", inactive: "Inactive" };
export default async function Account({ searchParams }: { searchParams: { saved?: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: p }, { data: adm }, s] = await Promise.all([sb.from("profiles").select("*").eq("user_id", user.id).maybeSingle(), sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(), getSettings()]);
  const types = lines(s.membership.tiers).map((l) => cols(l)[0]);
  return (
    <Shell><div className="mx-auto max-w-xl">
      <h1 className="text-4xl font-semibold tracking-tight">My account</h1>
      <p className="mt-2 text-ink/70">{user.email}</p>
      <p className="mt-4 inline-block rounded-full border border-gold px-4 py-1 text-sm">{label[p?.status ?? "pending"]}</p>
      {adm && <p className="mt-4"><a href="/admin" className="btn btn-blue">Open admin</a></p>}
      <form action={saveProfile} className="card mt-8 space-y-3">
        <label className="block text-sm">Full name<input name="full_name" defaultValue={p?.full_name ?? ""} className="field mt-1" /></label>
        <label className="block text-sm">Phone<input name="phone" defaultValue={p?.phone ?? ""} className="field mt-1" /></label>
        <label className="block text-sm">Membership type<select name="membership_type" defaultValue={p?.membership_type ?? ""} className="field mt-1"><option value="">Choose one</option>{types.map((t) => <option key={t}>{t}</option>)}</select></label>
        <button className="btn btn-blue">Save</button>
        {searchParams.saved === "1" && <p role="status" className="text-sm">Saved.</p>}
        {searchParams.saved === "error" && <p role="alert" className="text-sm text-red-600">Could not save. Run the database update first.</p>}
      </form>
      <p className="mt-4 text-sm text-ink/60">Membership is confirmed by the SPERART admin after payment.</p>
      <form action={signOut} className="mt-6"><button className="underline">Sign out</button></form>
    </div></Shell>
  );
}
