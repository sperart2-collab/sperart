import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 150);
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { error } = await supabaseServer().from("subscribers").insert({ email });
  if (error && error.code !== "23505") return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
