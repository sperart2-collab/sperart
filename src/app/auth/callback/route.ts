import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
/** Exchange the confirmation code and send administrators to their dashboard. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sb = supabaseServer();
  const code = url.searchParams.get("code");
  if (code) await sb.auth.exchangeCodeForSession(code);
  const { data: { user } } = await sb.auth.getUser();
  let destination = "/account";
  if (user) {
    const { data: admin } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    if (admin) destination = "/admin";
  }
  const next = url.searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//") && destination !== "/admin") destination = next;
  return NextResponse.redirect(new URL(destination, url.origin));
}
