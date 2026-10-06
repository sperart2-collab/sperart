"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead, markNotificationRead } from "@/app/account/actions";
type N = { id: string; title: string; body: string; link?: string | null; created_at: string; read_at?: string | null };
export default function NotificationBell({ notifications }: { notifications: N[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read_at).length;
  return <div className="relative">
    <button type="button" onClick={() => setOpen(!open)} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative grid h-11 w-11 place-items-center rounded-full border border-gold bg-white text-xl shadow-sm hover:shadow-[0_0_18px_rgba(255,201,60,.5)]">🔔
      {unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-blue px-1 text-[11px] font-bold text-white">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <div className="absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-blue/10 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-blue/10 px-4 py-3"><p className="font-semibold">Notifications</p>{unread > 0 && <form action={async () => { await markAllNotificationsRead(); router.refresh(); }}><button type="submit" className="text-xs text-blue underline">Mark all read</button></form>}</div>
      <div className="max-h-80 overflow-y-auto">
        {!notifications.length && <p className="p-5 text-sm text-ink/60">You're all caught up.</p>}
        {notifications.map((n) => <div key={n.id} className={`border-b border-blue/5 p-4 ${n.read_at ? "opacity-60" : "bg-blue/5"}`}>
          <p className="font-semibold">{n.title}</p><p className="mt-1 text-sm text-ink/70">{n.body}</p>{n.link && <a href={n.link} className="mt-2 inline-block text-xs text-blue underline">Open</a>}<p className="mt-2 text-xs text-ink/40">{new Date(n.created_at).toLocaleString()}</p>
          {!n.read_at && <form action={async (fd) => { await markNotificationRead(fd); router.refresh(); }} className="mt-2"><input type="hidden" name="id" value={n.id} /><button type="submit" className="text-xs text-blue underline">Mark read</button></form>}
        </div>)}
      </div>
    </div>}
  </div>;
}
