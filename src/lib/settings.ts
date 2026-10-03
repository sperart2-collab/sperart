import { supabaseServer } from "@/lib/supabase/server";
import { defaults } from "@/config/content";
export type Settings = typeof defaults;
/** Defaults merged with whatever the admin saved in site_settings. */
export async function getSettings(): Promise<Settings> {
  const out: Record<string, any> = structuredClone(defaults);
  try {
    const { data } = await supabaseServer().from("site_settings").select("key,value");
    data?.forEach((r) => { if (r.key in out) out[r.key] = { ...out[r.key], ...r.value }; });
  } catch {}
  return out as Settings;
}
export const lines = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
export const cols = (l: string) => l.split("|").map((x) => x.trim());
