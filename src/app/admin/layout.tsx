import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";
import { signOut } from "./actions";
const nav = [["Overview", "/admin"], ["AI Assistant", "/admin/assistant"], ["Messages", "/admin/inbox"], ["Edit content", "/admin/content"], ["Media", "/admin/media"], ["News", "/admin/manage/news"], ["Events", "/admin/manage/events"], ["Academy", "/admin/manage/lessons"], ["Recognition", "/admin/manage/recognition"], ["Library", "/admin/manage/library"], ["Registrations", "/admin/registrations"], ["Members", "/admin/members"], ["Subscribers", "/admin/subscribers"]];
/** Server-side gate: signed in AND listed in public.admins. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: admin } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/");
  return (
    <div className="min-h-screen bg-bone text-ink md:flex">
      <aside className="bg-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto md:border-r md:border-blue/15">
        <div className="flex items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-2"><img src="/emblem.png" alt="SPERART" className="h-9 w-9 rounded-full object-contain" /><span className="neon-blue font-semibold tracking-[.18em]">SPERART</span></a>
          <div className="flex items-center gap-3"><ThemeToggle /><form action={signOut} className="md:hidden"><button className="text-sm underline">Sign out</button></form></div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:flex-col md:gap-1 md:px-3">
          {nav.map(([t, h]) => <a key={h} href={h} className="whitespace-nowrap rounded-full px-4 py-2 text-sm transition hover:bg-blue/10 hover:shadow-[0_0_14px_rgba(15,82,255,.25)] md:rounded-xl">{t}</a>)}
        </nav>
        <form action={signOut} className="hidden px-5 py-4 md:block"><button className="text-sm underline">Sign out</button></form>
      </aside>
      <main className="mx-auto w-full max-w-5xl flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
