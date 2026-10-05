import { NextResponse } from "next/server";
import { askAssistant } from "@/lib/ai/service";
import { supabaseServer } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
const BASE = `You are Spar, the friendly assistant on sperart.org, the website of SPERART (Society of Percussive Art), an organization for percussion music and the percussive arts (drums, mallets, hand percussion and rhythm).
Reply in at most 3 short sentences. Use ONLY the facts below. Never invent events, prices, staff, dates or history. If the answer is not in the facts, a detail is in square brackets (not set yet), or the person needs a human (booking, payment, complaint, partnership, membership approval), say you will connect them to the admin and end your reply with the exact token [[ESCALATE]].
Pages: /about, /media, /news, /events, /academy, /membership, /join.`;
async function facts() {
  try {
    const sb = supabaseServer(), s = await getSettings();
    const [ev, ar, ls] = await Promise.all([
      sb.from("events").select("title,starts_at,location").eq("status", "published").gte("starts_at", new Date().toISOString()).order("starts_at").limit(5),
      sb.from("articles").select("title").eq("status", "published").order("created_at", { ascending: false }).limit(5),
      sb.from("lessons").select("title,level,category").eq("status", "published").limit(15),
    ]);
    const real = (t: string) => (t.startsWith("[Placeholder]") ? "" : t);
    return [
      `Contact: ${s.contact.email}, ${s.contact.phone}, ${s.contact.address}.`,
      real(s.about.mission) && `Mission: ${real(s.about.mission)}`,
      `Membership types (type | price | description): ${s.membership.tiers}`,
      `Upcoming events: ${ev.data?.map((e) => `${e.title} on ${e.starts_at} at ${e.location ?? "TBA"}`).join("; ") || "none listed"}.`,
      `Latest news: ${ar.data?.map((a) => a.title).join("; ") || "none"}.`,
      `Academy: ${ls.data?.map((l) => `${l.title} (${l.category}, ${l.level})`).join("; ") || "lessons coming soon"}.`,
    ].filter(Boolean).join("\n");
  } catch { return ""; }
}
const hits = new Map<string, { n: number; t: number }>();
/** Best-effort limit: 20 questions per visitor per hour (per server instance). */
function limited(ip: string) {
  const now = Date.now(), h = hits.get(ip);
  if (!h || now - h.t > 3600000) { hits.set(ip, { n: 1, t: now }); return false; }
  return ++h.n > 20;
}
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (limited(ip)) return NextResponse.json({ reply: "You have asked a lot of questions. Please message the admin directly. [[ESCALATE]]" });
    const { messages } = await req.json();
    const clean = (Array.isArray(messages) ? messages : []).slice(-8)
      .map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 500) })) as { role: "user" | "assistant"; content: string }[];
    if (!clean.length || clean[0].role !== "user") return NextResponse.json({ reply: "Ask me a question about SPERART." });
    const reply = await askAssistant(clean, `${BASE}\n\nFACTS:\n${await facts()}`);
    return NextResponse.json({ reply: reply || "Let me connect you with the admin. [[ESCALATE]]" });
  } catch {
    return NextResponse.json({ reply: "I can't answer right now, but I can pass your message to the admin. [[ESCALATE]]" });
  }
}
