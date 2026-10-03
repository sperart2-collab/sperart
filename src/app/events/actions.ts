"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export async function registerForEvent(f: FormData) {
  const slug = String(f.get("slug")), email = String(f.get("email") ?? "").trim(), name = String(f.get("name") ?? "").trim().slice(0, 100);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) redirect(`/events/${slug}?registered=error`);
  const { error } = await supabaseServer().from("registrations").insert({ event_id: String(f.get("event_id")), name, email: email.slice(0, 150), phone: String(f.get("phone") ?? "").slice(0, 30) });
  redirect(`/events/${slug}?registered=${error ? "error" : "1"}`);
}
