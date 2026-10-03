import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
/** Server-side gate: signed in AND listed in public.admins. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: admin } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/");
  return <div className="min-h-screen bg-bone text-ink"><div className="mx-auto max-w-5xl p-6 md:p-10">{children}</div></div>;
}
