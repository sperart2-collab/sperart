import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { askAssistant } from "@/lib/ai/service";
const SYSTEM = `You are the writing assistant for the SPERART (Society of Percussive Art) admin. You only suggest drafts; the admin reviews and approves them. Never invent facts about the organization (dates, prices, names, awards). If details are missing, write the draft with clear [placeholders] and say what to fill in.
Reply with ONLY a JSON object: {"reply":"short friendly message","draft":null or {"type":"news" or "events" or "lessons","title":"","summary":"","body":"","location":"","level":"Beginner" or "Intermediate" or "Advanced","category":"Lesson" or "Rudiment"}}. Use a draft only when asked to write an announcement, news article, event or lesson. Keep body as plain text.`;
export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adm) return NextResponse.json({ error: "auth" }, { status: 403 });
  const { messages } = await req.json();
  const clean = (Array.isArray(messages) ? messages : []).slice(-10).map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 1500) })) as { role: "user" | "assistant"; content: string }[];
  if (!clean.length) return NextResponse.json({ reply: "What would you like to write?", draft: null });
  const [a, e, l] = await Promise.all([sb.from("articles").select("title").eq("status", "draft").limit(10), sb.from("events").select("title").eq("status", "draft").limit(10), sb.from("lessons").select("title").eq("status", "draft").limit(10)]);
  const ctx = `\nUnpublished drafts now: news: ${a.data?.map((x) => x.title).join("; ") || "none"}. events: ${e.data?.map((x) => x.title).join("; ") || "none"}. lessons: ${l.data?.map((x) => x.title).join("; ") || "none"}.`;
  try {
    const raw = await askAssistant(clean, SYSTEM + ctx);
    try { return NextResponse.json(JSON.parse(raw.replace(/```json|```/g, "").trim())); } catch { return NextResponse.json({ reply: raw, draft: null }); }
  } catch { return NextResponse.json({ reply: "The AI is unavailable right now. Check the OpenRouter key in Netlify.", draft: null }); }
}
