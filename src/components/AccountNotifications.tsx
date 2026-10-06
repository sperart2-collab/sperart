import { markAllNotificationsRead, markNotificationRead } from "@/app/account/actions";

type N = { id: string; title: string; body: string; type: string; link: string | null; created_at: string; read_at: string | null };
const time = (v: string) => new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(v));

export default function AccountNotifications({ items }: { items: N[] }) {
  const unread = items.filter((n) => !n.read_at).length;
  return <section className="rounded-[28px] border border-blue/10 bg-[linear-gradient(135deg,#06122E_0%,#0A2458_55%,#0F52FF_140%)] p-5 text-white shadow-[0_24px_80px_rgba(6,18,46,.22)] md:p-6">
    <div className="flex items-center justify-between gap-4">
      <div><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-white/10">◉</span><h2 className="text-lg font-semibold">Notifications</h2>{unread > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">{unread > 99 ? "99+" : unread}</span>}</div><p className="mt-1 text-sm text-white/65">Updates from SPERART appear here.</p></div>
      {unread > 0 && <form action={markAllNotificationsRead}><button className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/10">Mark all read</button></form>}
    </div>
    <div className="mt-5 space-y-2">
      {!items.length && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">You’re all caught up.</p>}
      {items.slice(0, 8).map((n) => <form key={n.id} action={markNotificationRead}>
        <input type="hidden" name="id" value={n.id}/><input type="hidden" name="link" value={n.link || "/account"}/>
        <button className={`group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10 ${n.read_at ? "border-white/10 bg-white/[.03]" : "border-gold/40 bg-white/[.08]"}`}>
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.read_at ? "bg-white/20" : "bg-gold shadow-[0_0_12px_#FFC93C]"}`}/>
          <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-3"><strong className="text-sm">{n.title}</strong><small className="shrink-0 text-white/45">{time(n.created_at)}</small></span><span className="mt-1 block text-sm leading-6 text-white/65">{n.body}</span></span>
        </button>
      </form>)}
    </div>
  </section>;
}
