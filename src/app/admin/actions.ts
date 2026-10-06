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
export async function signOut() {
  await supabaseServer().auth.signOut();
  redirect("/");
}
