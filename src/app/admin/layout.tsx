import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "./actions";
const nav = [["Overview", "/admin"], ["Messages", "/admin/inbox"], ["Edit content", "/admin/content"], ["Media", "/admin/media"], ["News", "/admin/manage/news"], ["Events", "/admin/manage/events"], ["Registrations", "/admin/registrations"], ["Members", "/admin/members"]];
/** Server-side gate: signed in AND listed in public.admins. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: admin } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/");
  return (
    <div className="min-h-screen bg-bone text-ink">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-blue/15 bg-white px-5 py-3">
        <a href="/" className="font-semibold tracking-[.2em]">SPERART</a>
        <nav className="flex flex-wrap gap-4 text-sm">{nav.map(([t, h]) => <a key={h} href={h} className="nl">{t}</a>)}</nav>
        <form action={signOut} className="ml-auto"><button className="text-sm underline">Sign out</button></form>
      </header>
      <div className="mx-auto max-w-5xl p-5 md:p-10">{children}</div>
    </div>
  );
}
