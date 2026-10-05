import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { getSettings, lines, cols } from "@/lib/settings";
/** Starts a Flutterwave checkout for a membership tier. Needs FLW_SECRET_KEY. */
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const go = (path: string) => NextResponse.redirect(`${origin}${path}`, 303);
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return go("/login");
  const f = await req.formData();
  const row = lines((await getSettings()).membership.tiers)[Number(f.get("tier"))] ?? "";
  const [tier, , , amt] = cols(row), amount = Number(amt);
  if (!process.env.FLW_SECRET_KEY || !(amount > 0)) return go("/membership?pay=unavailable");
  const tx_ref = `sperart-${user.id.slice(0, 8)}-${Date.now()}`;
  const r = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ tx_ref, amount, currency: "NGN", redirect_url: `${origin}/account?paid=1`, customer: { email: user.email }, customizations: { title: "SPERART membership", description: tier }, meta: { user_id: user.id, tier } }),
  });
  const link = (await r.json())?.data?.link;
  if (!link) return go("/membership?pay=error");
  await adminClient().from("payments").insert({ tx_ref, user_id: user.id, tier, amount });
  return NextResponse.redirect(link, 303);
}
