"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function markHandled(f: FormData) {
  await supabaseServer().from("inquiries").update({ status: "handled" }).eq("id", String(f.get("id")));
  revalidatePath("/admin/inbox");
}

export async function replyToMember(f: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const email = String(f.get("email") ?? "").trim().toLowerCase();
  const body = String(f.get("body") ?? "").trim().slice(0, 5000);
  if (!email || !body) return;
  const { data: member } = await sb.from("profiles").select("user_id,full_name,email").ilike("email", email).maybeSingle();
  if (!member) redirect("/admin/inbox?error=Member+account+not+found");
  const { error } = await sb.from("member_messages").insert({ sender_id: user.id, recipient_id: member.user_id, body });
  if (error) redirect(`/admin/inbox?error=${encodeURIComponent(error.message)}`);
  await sb.from("notifications").insert({ user_id: member.user_id, title: "New message from SPERART", body: body.length > 180 ? `${body.slice(0, 177)}…` : body, type: "message", link: "/account?messages=1" });
  revalidatePath("/admin/inbox");
  revalidatePath("/account");
  redirect("/admin/inbox?sent=web");
}

export async function sendEmailReply(f: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const to = String(f.get("to") ?? "").trim();
  const subject = String(f.get("subject") ?? "Re: your message to SPERART").slice(0, 200);
  const text = String(f.get("body") ?? "").trim().slice(0, 5000);
  if (!to || !text) return;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM ?? "SPERART <onboarding@resend.dev>";
  if (!key) redirect("/admin/inbox?error=Resend+API+key+is+not+configured+in+Netlify");
  const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, text }) });
  if (!res.ok) redirect("/admin/inbox?error=Email+could+not+be+sent");
  revalidatePath("/admin/inbox");
  redirect("/admin/inbox?sent=email");
}
