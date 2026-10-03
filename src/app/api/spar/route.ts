import { NextResponse } from "next/server";
import { askAssistant } from "@/lib/ai/service";
import { site } from "@/config/site";
const SYSTEM = `You are Spar, the friendly assistant on sperart.org, a percussion, rhythm and culture arts organization.
Reply in at most 3 short sentences. Use ONLY these facts: the site has sections for what SPERART does (percussion education, performances, workshops, cultural preservation, youth programs, research), an Academy, events and membership that are still being set up; contact is ${site.contact.email}, ${site.contact.phone}, ${site.contact.address}.
Never invent events, prices, staff, dates or history. If the answer is not in these facts, or the person needs a human (booking, registration, payment, complaint, partnership, membership approval), say you will connect them to the admin and end your reply with the exact token [[ESCALATE]].`;
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const clean = (Array.isArray(messages) ? messages : []).slice(-8)
      .map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 500) })) as { role: "user" | "assistant"; content: string }[];
    if (!clean.length || clean[0].role !== "user") return NextResponse.json({ reply: "Ask me a question about SPERART." });
    const reply = await askAssistant(clean);
    return NextResponse.json({ reply: reply || "Let me connect you with the admin. [[ESCALATE]]" });
  } catch {
    return NextResponse.json({ reply: "I can't answer right now, but I can pass your message to the admin. [[ESCALATE]]" });
  }
}
