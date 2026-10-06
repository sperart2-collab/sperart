"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
export async function saveProfile(f: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await sb.from("profiles").update({ full_name: String(f.get("full_name") ?? "").slice(0, 100), phone: String(f.get("phone") ?? "").slice(0, 30), membership_type: String(f.get("membership_type") ?? "") }).eq("user_id", user.id);
  redirect(`/account?saved=${error ? "error" : "1"}`);
}
export async function sendMemberReply(f: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const body = String(f.get("body") ?? "").trim().slice(0, 5000);
  if (!body) return;
  const { data: admin } = await sb.from("admins").select("user_id").limit(1).maybeSingle();
  if (!admin) return;
  await sb.from("member_messages").insert({ sender_id: user.id, recipient_id: admin.user_id, body });
  await sb.from("notifications").insert({ user_id: admin.user_id, title: "New member message", body: body.length > 180 ? `${body.slice(0, 177)}…` : body, type: "message", link: "/admin/inbox" });
  revalidatePath("/account");
  revalidatePath("/admin/inbox");
}
export async function markNotificationRead(f: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", String(f.get("id"))).eq("user_id", user.id);
  revalidatePath("/account");
}
export async function markAllNotificationsRead() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/account");
}
