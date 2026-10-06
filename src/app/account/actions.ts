"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function currentUser() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  return { sb, user };
}

export async function saveProfile(f: FormData) {
  const { sb, user } = await currentUser();
  const { error } = await sb.from("profiles").update({
    full_name: String(f.get("full_name") ?? "").slice(0, 100),
    phone: String(f.get("phone") ?? "").slice(0, 30),
    membership_type: String(f.get("membership_type") ?? "").slice(0, 100),
  }).eq("user_id", user.id);
  revalidatePath("/account");
  redirect(`/account?saved=${error ? "error" : "1"}`);
}

export async function markNotificationRead(f: FormData) {
  const { sb, user } = await currentUser();
  const id = String(f.get("id") ?? "");
  const link = String(f.get("link") ?? "/account");
  if (id) await sb.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/account");
  redirect(link.startsWith("/") ? link : "/account");
}

export async function markAllNotificationsRead() {
  const { sb, user } = await currentUser();
  await sb.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/account");
  redirect("/account?notice=read");
}

export async function sendMemberMessage(f: FormData) {
  const { sb, user } = await currentUser();
  const body = String(f.get("body") ?? "").trim().slice(0, 5000);
  if (!body) redirect("/account?message=empty");
  const { data: admins } = await sb.from("admins").select("user_id").limit(1);
  const adminId = admins?.[0]?.user_id;
  if (!adminId) redirect("/account?message=error");
  const { error } = await sb.from("member_messages").insert({ sender_id: user.id, recipient_id: adminId, body });
  if (error) redirect("/account?message=error");
  await sb.from("notifications").insert({ user_id: adminId, title: "New member message", body: `${user.email ?? "A member"}: ${body.slice(0, 140)}`, type: "message", link: "/admin/inbox" });
  revalidatePath("/account");
  revalidatePath("/admin/inbox");
  redirect("/account?message=sent");
}
