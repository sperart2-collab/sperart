import { unstable_cache } from "next/cache";
import { publicClient } from "@/lib/public";
import { defaults } from "@/config/content";
export type Settings = typeof defaults;
const load = unstable_cache(async () => {
  const { data } = await publicClient().from("site_settings").select("key,value");
  return data ?? [];
}, ["site-settings"], { revalidate: 60, tags: ["settings"] });
/** Defaults merged with what the admin saved. Cached for 60 seconds (cleared when the admin saves). */
export async function getSettings(): Promise<Settings> {
  const out: Record<string, any> = structuredClone(defaults);
  try { (await load()).forEach((r) => { if (r.key in out) out[r.key] = { ...out[r.key], ...r.value }; }); } catch {}
  return out as Settings;
}
export const lines = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
export const cols = (l: string) => l.split("|").map((x) => x.trim());
