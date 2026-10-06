"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { kinds } from "@/config/manage";
import { sections } from "@/config/content";
import { getSettings, lines } from "@/lib/settings";
import { storage } from "@/lib/storage";
export type Action = { type: string; args: Record<string, any> };
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
type SB = ReturnType<typeof supabaseServer>;
async function exec(sb: SB, a: Action): Promise<string> {
  const g = a.args ?? {};
  switch (a.type) {
    case "create_draft": {
      const k = kinds[g.kind];
      if (!k) return "Unknown content type.";
      const row: Record<string, unknown> = { status: "draft" };
      for (const [n, , t] of k.fields) {
        const v = g[n];
        if (n === "status" || v === undefined || v === "") continue;
        if (t === "datetime") { const d = /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(String(v)) ? new Date(`${v}:00+01:00`) : new Date(v); if (!isNaN(+d)) row[n] = d.toISOString(); }
        else if (t === "number") row[n] = Number(v) || null;
        else if (t?.startsWith("opts:")) { if (t.slice(5).split(",").includes(String(v))) row[n] = v; }
        else row[n] = String(v);
      }
      const title = String(row.title ?? "Untitled");
      row.title = title; row.slug = `${slugify(title) || "item"}-${Math.random().toString(36).slice(2, 6)}`;
      const { error } = await sb.from(k.table).insert(row);
      return error ? `Could not create: ${error.message}` : `Created draft ${g.kind}: ${title}`;
    }
    case "set_status": {
      const k = kinds[g.kind];
      if (!k || !["draft", "published"].includes(g.status)) return "Invalid request.";
      const { error } = await sb.from(k.table).update({ status: g.status }).eq("id", g.id);
      return error ? `Failed: ${error.message}` : `Set ${g.kind} to ${g.status}.`;
    }
    case "approve_member": {
      const { data: p } = await sb.from("profiles").select("user_id").ilike("email", String(g.email)).maybeSingle();
      if (!p) return `No member with email ${g.email}.`;
      const { error } = await sb.rpc("set_member_status", { uid: p.user_id, new_status: g.status ?? "active" });
      return error ? `Failed: ${error.message}` : `Member ${g.email} is now ${g.status ?? "active"}.`;
    }
    case "handle_message": {
      const { error } = await sb.from("inquiries").update({ status: "handled" }).eq("id", g.id);
      return error ? `Failed: ${error.message}` : "Message marked handled.";
    }
    case "set_content": {
      const sec = sections[g.section];
      if (!sec || !sec.fields.some((f) => f[0] === g.field)) return "Unknown content field.";
      const cur = (await getSettings()) as Record<string, any>;
      const { error } = await sb.from("site_settings").upsert({ key: g.section, value: { ...cur[g.section], [g.field]: String(g.value ?? "") } });
      revalidateTag("settings");
      return error ? `Failed: ${error.message}` : `Updated ${g.section} / ${g.field}.`;
    }
    case "add_hero_video": {
      const { data: m } = await sb.from("media").select("path,title").eq("id", g.media_id).eq("kind", "video").maybeSingle();
      if (!m) return "That video was not found in Media.";
      const s = await getSettings();
      const { error } = await sb.from("site_settings").upsert({ key: "hero", value: { ...s.hero, videos: [...lines(s.hero.videos), storage.publicUrl("media", m.path)].join("\n") } });
      revalidateTag("settings");
      return error ? `Failed: ${error.message}` : `Added "${m.title}" to the homepage hero.`;
    }
    case "delete_item": {
      const k = kinds[g.kind];
      if (!k) return "Unknown content type.";
      const { error } = await sb.from(k.table).delete().eq("id", g.id);
      return error ? `Failed: ${error.message}` : `Deleted ${g.kind}.`;
    }
    default: return `I cannot do "${a.type}".`;
  }
}
/** Runs AI-proposed actions as the signed-in admin. Everything is logged to ai_actions. */
export async function runActions(actions: Action[], auto: boolean): Promise<string[]> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return ["Please sign in again."];
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adm) return ["Not allowed."];
  const out: string[] = [];
  for (const a of actions.slice(0, 8)) {
    let r: string;
    try { r = await exec(sb, a); } catch (e) { r = `Failed: ${(e as Error).message}`; }
    out.push(r);
    await sb.from("ai_actions").insert({ admin_id: user.id, type: a.type, args: a.args, result: r, auto });
  }
  revalidatePath("/", "layout");
  return out;
}
