import { createClient } from "@supabase/supabase-js";
/** Server-only client with the service role key. Bypasses RLS: use only for trusted work such as payment webhooks. */
export const adminClient = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
