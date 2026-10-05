import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Subscribers() {
  const { data } = await supabaseServer().from("subscribers").select("email,created_at").order("created_at", { ascending: false });
  return (
    <>
      <h1 className="text-3xl font-semibold">Newsletter subscribers</h1>
      <p className="mt-2 text-ink/70">{data?.length ?? 0} subscribers</p>
      {!!data?.length && <textarea readOnly rows={12} className="field mt-6 font-mono text-sm" value={data.map((s) => s.email).join(", ")} aria-label="Emails to copy" />}
    </>
  );
}
