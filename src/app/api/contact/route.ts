import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim().slice(0, 100), email = String(b.email ?? "").trim().slice(0, 150), message = String(b.message ?? "").trim().slice(0, 1500);
  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { error } = await supabaseServer().from("inquiries").insert({ name, email, message });
  return error ? NextResponse.json({ error: "Failed" }, { status: 500 }) : NextResponse.json({ ok: true });
}
