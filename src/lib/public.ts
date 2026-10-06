import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
/** Cookie-free anon client for public data, so cached pages stay fast. */
export const publicClient = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
export const latestVideos = unstable_cache(async () => {
  const { data } = await publicClient().from("media").select("id,path,title").eq("kind", "video").order("created_at", { ascending: false }).limit(3);
  return data ?? [];
}, ["latest-videos"], { revalidate: 60, tags: ["media"] });
