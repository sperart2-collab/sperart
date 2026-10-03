import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/notify";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim().slice(0, 100), email = String(b.email ?? "").trim().slice(0, 150), message = String(b.message ?? "").trim().slice(0, 1500);
  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { error } = await supabaseServer().from("inquiries").insert({ name, email, message });
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  await notifyAdmin("New message for SPERART", `${name} (${email}) wrote:\n\n${message}\n\nReply from Admin > Messages.`);
  return NextResponse.json({ ok: true });
}
