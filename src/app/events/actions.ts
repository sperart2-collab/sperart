"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/notify";
export async function registerForEvent(f: FormData) {
  const slug = String(f.get("slug")), email = String(f.get("email") ?? "").trim(), name = String(f.get("name") ?? "").trim().slice(0, 100);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) redirect(`/events/${slug}?registered=error`);
  const sb = supabaseServer(), eid = String(f.get("event_id"));
  const { data: ev } = await sb.from("events").select("capacity").eq("id", eid).maybeSingle();
  if (ev?.capacity) {
    const { data: n } = await sb.rpc("registrations_count", { eid });
    if ((n ?? 0) >= ev.capacity) redirect(`/events/${slug}?registered=full`);
  }
  const { error } = await supabaseServer().from("registrations").insert({ event_id: String(f.get("event_id")), name, email: email.slice(0, 150), phone: String(f.get("phone") ?? "").slice(0, 30) });
  if (!error) await notifyAdmin("New event registration", `${name} (${email}) registered for: ${slug}`);
  redirect(`/events/${slug}?registered=${error ? "error" : "1"}`);
}
