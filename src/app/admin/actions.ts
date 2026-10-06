"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { sections } from "@/config/content";
import { getSettings, lines } from "@/lib/settings";
/** All writes run as the signed-in user; RLS only allows admins. */
export async function saveSection(f: FormData) {
  const key = String(f.get("_key")), sec = sections[key];
  if (!sec) return;
  const value: Record<string, string> = {};
  for (const [name] of sec.fields) value[name] = String(f.get(name) ?? "");
  const { error } = await supabaseServer().from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
  revalidateTag("settings");
  redirect(`/admin/content?saved=${error ? "error" : key}`);
}
export async function addHeroVideo(url: string) {
  const s = await getSettings();
  const videos = [...lines(s.hero.videos), url].join("\n");
  await supabaseServer().from("site_settings").upsert({ key: "hero", value: { ...s.hero, videos } });
  revalidatePath("/", "layout");
  revalidateTag("settings");
}
export async function markHandled(f: FormData) {
  await supabaseServer().from("inquiries").update({ status: "handled" }).eq("id", String(f.get("id")));
  revalidatePath("/admin/inbox");
}
export async function replyMember(f: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: admin } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/");
  const recipientId = String(f.get("recipient_id") ?? "");
  const body = String(f.get("body") ?? "").trim().slice(0, 5000);
  if (!recipientId || !body) redirect("/admin/inbox?member=error");
  const { error } = await sb.from("member_messages").insert({ sender_id: user.id, recipient_id: recipientId, body });
  if (!error) await sb.from("notifications").insert({ user_id: recipientId, title: "New message from SPERART", body: body.slice(0, 180), type: "message", link: "/account" });
  revalidatePath("/admin/inbox"); revalidatePath("/account");
  redirect(`/admin/inbox?member=${error ? "error" : "sent"}`);
}
export async function signOut() {
  await supabaseServer().auth.signOut();
  redirect("/");
}
