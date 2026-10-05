import { adminClient } from "@/lib/supabase/admin";
/** Flutterwave webhook. Set the same secret hash in the Flutterwave dashboard and in FLW_WEBHOOK_HASH. Verifies the payment with Flutterwave before activating the member. */
export async function POST(req: Request) {
  const hash = process.env.FLW_WEBHOOK_HASH;
  if (!hash || req.headers.get("verif-hash") !== hash) return new Response("Forbidden", { status: 401 });
  const ev = await req.json().catch(() => null);
  const id = ev?.data?.id, ref = ev?.data?.tx_ref;
  if (!id || !ref) return new Response("ok");
  const v = await (await fetch(`https://api.flutterwave.com/v3/transactions/${id}/verify`, { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } })).json();
  const db = adminClient();
  const { data: p } = await db.from("payments").select("*").eq("tx_ref", ref).maybeSingle();
  if (p && p.status !== "paid" && v?.data?.status === "successful" && v.data.tx_ref === ref && v.data.currency === "NGN" && Number(v.data.amount) >= Number(p.amount)) {
    await db.from("payments").update({ status: "paid" }).eq("tx_ref", ref);
    await db.from("profiles").update({ status: "active", membership_type: p.tier }).eq("user_id", p.user_id);
  }
  return new Response("ok");
}
