"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export async function saveProfile(f: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await sb.from("profiles").update({ full_name: String(f.get("full_name") ?? "").slice(0, 100), phone: String(f.get("phone") ?? "").slice(0, 30), membership_type: String(f.get("membership_type") ?? "") }).eq("user_id", user.id);
  redirect(`/account?saved=${error ? "error" : "1"}`);
}
