"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { kinds } from "@/config/manage";
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
export async function saveRecord(f: FormData) {
  const kind = String(f.get("_kind")), k = kinds[kind];
  if (!k) return;
  const id = String(f.get("_id") || "");
  const row: Record<string, string | null> = {};
  for (const [name, , type] of k.fields) {
    let v = String(f.get(name) ?? "").trim();
    if (type === "datetime") { if (!v) continue; v = new Date(`${v}:00+01:00`).toISOString(); }
    if (type === "number") { row[name] = v || null; continue; }
    row[name] = v;
  }
  if (!row.title) row.title = "Untitled";
  const sb = supabaseServer();
  const { error } = id
    ? await sb.from(k.table).update(row).eq("id", id)
    : await sb.from(k.table).insert({ ...row, slug: `${slugify(row.title ?? "") || "item"}-${Math.random().toString(36).slice(2, 6)}` });
  revalidatePath("/", "layout");
  redirect(`/admin/manage/${kind}?${error ? "error=" + encodeURIComponent(error.message) : "saved=1"}`);
}
export async function deleteRecord(f: FormData) {
  const kind = String(f.get("_kind")), k = kinds[kind];
  if (!k) return;
  await supabaseServer().from(k.table).delete().eq("id", String(f.get("_id")));
  revalidatePath("/", "layout");
  redirect(`/admin/manage/${kind}`);
}
export async function setMemberStatus(f: FormData) {
  const uid = String(f.get("uid")), status = String(f.get("status"));
  const { error } = await supabaseServer().rpc("set_member_status", { uid, new_status: status });
  revalidatePath("/admin/members");
  redirect(`/admin/members?${error ? "error=" + encodeURIComponent(error.message) : "ok=1"}`);
}
export async function createDraft(f: FormData) {
  const kind = String(f.get("type")), k = kinds[kind];
  if (!k || !["news", "events", "lessons"].includes(kind)) return;
  const g = (n: string) => String(f.get(n) ?? "").trim();
  const title = (g("title") || "Untitled").slice(0, 200);
  const common = { title, status: "draft", slug: `${slugify(title) || "item"}-${Math.random().toString(36).slice(2, 6)}` };
  const row: Record<string, unknown> = kind === "news" ? { ...common, excerpt: g("summary"), body: g("body") }
    : kind === "events" ? { ...common, description: g("body"), location: g("location"), ...(g("starts_at") ? { starts_at: new Date(`${g("starts_at")}:00+01:00`).toISOString() } : {}) }
    : { ...common, summary: g("summary"), body: g("body"), level: ["Beginner", "Intermediate", "Advanced"].includes(g("level")) ? g("level") : "Beginner", category: g("category") === "Rudiment" ? "Rudiment" : "Lesson" };
  const { error } = await supabaseServer().from(k.table).insert(row);
  revalidatePath("/", "layout");
  redirect(`/admin/manage/${kind}?${error ? "error=" + encodeURIComponent(error.message) : "saved=1"}`);
}
