import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
import { getSettings, lines, cols } from "@/lib/settings";
import { saveProfile, sendMemberReply } from "./actions";
import { signOut } from "../admin/actions";
import SubmitButton from "@/components/SubmitButton";
import NotificationBell from "@/components/NotificationBell";
import MemberAssistant from "@/components/MemberAssistant";
export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };
const label: Record<string, string> = { pending: "Pending approval", active: "Active member", inactive: "Inactive" };
export default async function Account({ searchParams }: { searchParams: { saved?: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: p }, { data: adm }, { data: notifications }, { data: messages }, s] = await Promise.all([
    sb.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
    sb.from("notifications").select("id,title,body,type,link,created_at,read_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    sb.from("member_messages").select("id,sender_id,recipient_id,body,created_at,read_at").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).order("created_at", { ascending: true }).limit(100),
    getSettings(),
  ]);
  const types = lines(s.membership.tiers).map((l) => cols(l)[0]);
  const unreadMessages = (messages ?? []).filter((m) => m.recipient_id === user.id && !m.read_at);
  if (unreadMessages.length) await sb.from("member_messages").update({ read_at: new Date().toISOString() }).in("id", unreadMessages.map((m) => m.id));
  const status = p?.status ?? "pending";
  return <Shell><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold tracking-[.18em] text-blue">SPERART MEMBER PORTAL</p><h1 className="mt-1 text-4xl font-semibold tracking-tight">Welcome{p?.full_name ? `, ${p.full_name.split(" ")[0]}` : " back"}.</h1><p className="mt-2 text-ink/60">Your membership, messages, notifications and SPERART resources in one place.</p></div><div className="flex items-center gap-3"><NotificationBell notifications={notifications ?? []} />{adm && <a href="/admin" className="btn btn-blue !px-4 !py-2">Admin</a>}</div></div>
    <div className="mt-7 grid gap-4 md:grid-cols-3">
      <div className="card"><p className="text-sm text-ink/60">Membership status</p><p className="mt-2 text-xl font-semibold">{label[status]}</p><p className="mt-1 text-sm text-ink/60">{p?.membership_type || "Membership type not selected"}</p></div>
      <div className="card"><p className="text-sm text-ink/60">Account email</p><p className="mt-2 break-all font-semibold">{user.email}</p><p className="mt-1 text-sm text-ink/60">Verified account</p></div>
      <div className="card"><p className="text-sm text-ink/60">Notifications</p><p className="mt-2 text-xl font-semibold">{(notifications ?? []).filter((n) => !n.read_at).length} unread</p><p className="mt-1 text-sm text-ink/60">{unreadMessages.length} unread account message{unreadMessages.length === 1 ? "" : "s"}</p></div>
    </div>
    {status === "pending" && <div className="mt-6 rounded-2xl border border-gold bg-white p-5"><p className="font-semibold">Your membership is waiting for admin approval.</p><p className="mt-1 text-sm text-ink/70">You can complete your profile and use the member assistant while SPERART reviews your membership.</p></div>}
    {status === "inactive" && <div className="mt-6 rounded-2xl border border-gold bg-white p-5"><p className="font-semibold">Your membership is currently inactive.</p><p className="mt-1 text-sm text-ink/70">Contact SPERART if you need help restoring your membership.</p></div>}

    <section className="mt-8"><div className="flex items-end justify-between gap-3"><div><h2 className="text-2xl font-semibold">Your account</h2><p className="mt-1 text-sm text-ink/60">Keep your member information up to date.</p></div></div>
      <form action={saveProfile} className="card mt-4 grid gap-4 md:grid-cols-2"><label className="block text-sm">Full name<input name="full_name" defaultValue={p?.full_name ?? ""} className="field mt-1" /></label><label className="block text-sm">Phone<input name="phone" defaultValue={p?.phone ?? ""} className="field mt-1" /></label><label className="block text-sm md:col-span-2">Membership type<select name="membership_type" defaultValue={p?.membership_type ?? ""} className="field mt-1"><option value="">Choose one</option>{types.map((t) => <option key={t}>{t}</option>)}</select></label><div className="md:col-span-2 flex items-center gap-3"><SubmitButton>Save profile</SubmitButton>{searchParams.saved === "1" && <span role="status" className="text-sm text-blue">Saved.</span>}{searchParams.saved === "error" && <span role="alert" className="text-sm text-red-600">Could not save. Please try again.</span>}</div></form>
    </section>

    <section className="mt-8"><div className="flex items-end justify-between gap-3"><div><h2 className="text-2xl font-semibold">Messages</h2><p className="mt-1 text-sm text-ink/60">Talk directly with the SPERART team from your account.</p></div></div>
      <div className="card mt-4"><div className="max-h-72 space-y-3 overflow-y-auto">{!messages?.length && <p className="text-sm text-ink/60">No messages yet. Send the team a message below.</p>}{messages?.map((m) => <div key={m.id} className={`rounded-2xl p-3 ${m.sender_id === user.id ? "ml-8 bg-blue text-white" : "mr-8 bg-bone"}`}><p className="whitespace-pre-wrap">{m.body}</p><p className={`mt-1 text-xs ${m.sender_id === user.id ? "text-white/60" : "text-ink/40"}`}>{new Date(m.created_at).toLocaleString()}</p></div>)}</div><form action={sendMemberReply} className="mt-4 flex gap-2"><textarea name="body" required rows={2} className="field" placeholder="Message SPERART…" /><SubmitButton className="btn btn-blue self-end !px-5" pending="Sending…">Send</SubmitButton></form></div>
    </section>

    <MemberAssistant />
    <form action={signOut} className="mt-8 pb-8"><button className="text-sm underline">Sign out</button></form>
  </div></Shell>;
}
