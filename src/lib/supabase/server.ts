import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
/** Server-side client acting as the signed-in user. RLS in schema.sql enforces access. */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach((c) => store.set(c.name, c.value, c.options)); } catch {} },
    },
  });
}
