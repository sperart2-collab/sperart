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
  const row: Record<string, string> = {};
  for (const [name, , type] of k.fields) {
    let v = String(f.get(name) ?? "").trim();
    if (type === "datetime") { if (!v) continue; v = new Date(`${v}:00+01:00`).toISOString(); }
    row[name] = v;
  }
  if (!row.title) row.title = "Untitled";
  const sb = supabaseServer();
  const { error } = id
    ? await sb.from(k.table).update(row).eq("id", id)
    : await sb.from(k.table).insert({ ...row, slug: `${slugify(row.title) || "item"}-${Math.random().toString(36).slice(2, 6)}` });
  revalidatePath("/", "layout");
  redirect(`/admin/manage/${kind}?${error ? "error=1" : "saved=1"}`);
}
export async function deleteRecord(f: FormData) {
  const kind = String(f.get("_kind")), k = kinds[kind];
  if (!k) return;
  await supabaseServer().from(k.table).delete().eq("id", String(f.get("_id")));
  revalidatePath("/", "layout");
  redirect(`/admin/manage/${kind}`);
}
export async function setMemberStatus(f: FormData) {
  await supabaseServer().rpc("set_member_status", { uid: String(f.get("uid")), new_status: String(f.get("status")) });
  revalidatePath("/admin/members");
}
