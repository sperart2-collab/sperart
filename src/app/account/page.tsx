import { redirect } from "next/navigation";
import Shell from "@/components/Shell";
import AccountNotifications from "@/components/AccountNotifications";
import MemberAI from "@/components/MemberAI";
import { supabaseServer } from "@/lib/supabase/server";
import { getSettings, lines, cols } from "@/lib/settings";
import { saveProfile, sendMemberMessage } from "./actions";
import { signOut } from "../admin/actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };
const labels: Record<string,string> = { pending:"Pending approval", active:"Active member", inactive:"Inactive" };
export default async function Account({ searchParams }: { searchParams: { saved?: string; message?: string } }) {
  const sb = supabaseServer(); const { data:{ user } } = await sb.auth.getUser(); if (!user) redirect("/login");
  const [{data:p},{data:adm}, {data:notifications}, {data:messages}, settings] = await Promise.all([
    sb.from("profiles").select("*").eq("user_id",user.id).maybeSingle(), sb.from("admins").select("user_id").eq("user_id",user.id).maybeSingle(),
    sb.from("notifications").select("id,title,body,type,link,created_at,read_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30),
    sb.from("member_messages").select("id,sender_id,recipient_id,body,created_at,read_at").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).order("created_at",{ascending:true}).limit(20), getSettings()
  ]);
  const types = lines(settings.membership.tiers).map(l=>cols(l)[0]); const unread = (notifications??[]).filter(n=>!n.read_at).length; const status = p?.status ?? "pending";
  return <Shell><div className="mx-auto max-w-6xl">
    <div className="overflow-hidden rounded-[34px] bg-[radial-gradient(circle_at_80%_0%,rgba(76,141,255,.38),transparent_32%),linear-gradient(135deg,#06122E,#0A2458_55%,#0F52FF)] p-6 text-white shadow-[0_28px_90px_rgba(6,18,46,.24)] md:p-9">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[.28em] text-gold">Member space</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Welcome back, {p?.full_name?.split(" ")[0] || "member"}.</h1><p className="mt-3 max-w-2xl text-white/65">Your SPERART membership, messages, learning tools and updates — all in one place.</p></div><div className="flex items-center gap-3"><span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">{labels[status] || status}</span>{adm && <a href="/admin" className="btn border border-white/20 !px-4 !py-2 text-sm text-white">Admin</a>}</div></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-white/50">Membership</p><p className="mt-1 font-semibold">{p?.membership_type || "Not selected"}</p></div><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-white/50">Notifications</p><p className="mt-1 font-semibold">{unread ? `${unread} unread` : "All caught up"}</p></div><div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-white/50">Account email</p><p className="mt-1 truncate font-semibold">{user.email}</p></div></div>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.85fr]">
      <div className="space-y-6"><AccountNotifications items={notifications??[]} /><MemberAI /></div>
      <div className="space-y-6">
        <section className="card !rounded-[28px]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue">Profile</p><h2 className="mt-1 text-xl font-semibold">Your details</h2></div><span className="text-2xl">◌</span></div>
          <form action={saveProfile} className="mt-5 space-y-4"><label className="block text-sm">Full name<input name="full_name" defaultValue={p?.full_name??""} className="field mt-1" /></label><label className="block text-sm">Phone<input name="phone" defaultValue={p?.phone??""} className="field mt-1" /></label><label className="block text-sm">Membership type<select name="membership_type" defaultValue={p?.membership_type??""} className="field mt-1"><option value="">Choose one</option>{types.map(t=><option key={t}>{t}</option>)}</select></label><button className="btn btn-blue w-full">Save changes</button>{searchParams.saved === "1" && <p role="status" className="text-sm text-green-700">Profile updated.</p>}{searchParams.saved === "error" && <p role="alert" className="text-sm text-red-600">Could not save your profile.</p>}</form>
        </section>
        <section className="card !rounded-[28px]"><p className="text-xs font-bold uppercase tracking-[.2em] text-blue">Talk to SPERART</p><h2 className="mt-1 text-xl font-semibold">Message the team</h2><p className="mt-2 text-sm leading-6 text-ink/60">Ask about your membership, events, Academy or anything you need help with.</p><form action={sendMemberMessage} className="mt-4 space-y-3"><textarea name="body" className="field min-h-32 resize-y" placeholder="Write your message…"/><button className="btn btn-blue w-full">Send message</button>{searchParams.message === "sent" && <p className="text-sm text-green-700">Message sent to the SPERART team.</p>}{searchParams.message === "error" && <p className="text-sm text-red-600">Could not send your message.</p>}</form></section>
        <section className="card !rounded-[28px]"><p className="text-xs font-bold uppercase tracking-[.2em] text-blue">Conversation</p><h2 className="mt-1 text-xl font-semibold">Your messages</h2><div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{!messages?.length ? <p className="text-sm text-ink/50">Your conversations with SPERART will appear here.</p> : messages.map(m=><div key={m.id} className={`rounded-2xl p-3 text-sm ${m.sender_id===user.id?"ml-6 bg-blue text-white":"mr-6 bg-bone"}`}><p className="leading-6">{m.body}</p><p className="mt-1 text-[11px] opacity-50">{new Date(m.created_at).toLocaleString("en-NG")}</p></div>)}</div></section>
        <form action={signOut}><button className="w-full rounded-full border border-red-200 px-4 py-3 text-sm text-red-600 hover:bg-red-50">Sign out</button></form>
      </div>
    </div>
  </div></Shell>;
}
