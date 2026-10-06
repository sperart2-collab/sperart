import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
/** Email confirmation lands here: exchange the code for a session, then open the member account. */
export async function GET(req: Request) {
  const url = new URL(req.url), code = url.searchParams.get("code");
  if (code) await supabaseServer().auth.exchangeCodeForSession(code);
  return NextResponse.redirect(`${url.origin}/account`);
}
