import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { askAssistant } from "@/lib/ai/service";
import { getSettings } from "@/lib/settings";
const SYSTEM = `You are SPERART's digital admin assistant for the Society of Percussive Art website. You help the admin manage the whole site. You can see a SNAPSHOT of the site below. Never invent facts about the organization (dates, prices, names, awards); use [placeholders] and say what is missing.
Reply with ONLY JSON: {"reply":"friendly, clear message","actions":[]}. Put actions only when the admin asks you to do something. Each action is {"type":..., "args":{...}} using ONLY these:
- create_draft {kind: news|events|lessons|recognition|library, title, plus fields: news(excerpt,body,cover_url) events(starts_at "YYYY-MM-DDTHH:mm" Lagos time,location,description,capacity) lessons(category Lesson|Rudiment, level Beginner|Intermediate|Advanced, summary,body,video_url,audio_url) recognition(category Award|Scholarship|Honour|Competition|Featured Artist, year, summary, image_url) library(category Article|Research|Publication|Educational resource|Archive, tags, summary, url)}. Always saved as a DRAFT.
- set_status {kind, id, status: draft|published}. Use ids from the snapshot. Publish only when the admin asks.
- approve_member {email, status: active|inactive|pending}
- approve_pending_members {status: active|inactive|pending}. Use this when the admin asks to approve/deactivate all pending members.
- handle_message {id}
- set_content {section: hero|about|leadership|membership|contact|faq, field, value}
- add_hero_video {media_id}
- delete_item {kind, id}. Only when the admin explicitly asks to delete.
Media in the snapshot are files the admin uploaded; use their urls/ids. You may also monitor the site: point out pending members, new messages, drafts waiting, empty or placeholder content, and suggest fixes. Keep replies short.`;
export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adm) return NextResponse.json({ error: "auth" }, { status: 403 });
  const { messages } = await req.json();
  const clean = (Array.isArray(messages) ? messages : []).slice(-12).map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 1500) })) as { role: "user" | "assistant"; content: string }[];
  if (!clean.length) return NextResponse.json({ reply: "What would you like me to do?", actions: [] });
  const dr = (t: string) => sb.from(t).select("id,title").eq("status", "draft").limit(10);
  const [a, e, l, r, rs, pm, msgs, media, s] = await Promise.all([dr("articles"), dr("events"), dr("lessons"), dr("recognitions"), dr("resources"),
    sb.from("profiles").select("email,full_name,membership_type").eq("status", "pending").limit(10),
    sb.from("inquiries").select("id,name,message").eq("status", "new").limit(5),
    sb.from("media").select("id,kind,title,path").order("created_at", { ascending: false }).limit(15), getSettings()]);
  const f = (x: { data: { id: string; title: string }[] | null }) => x.data?.map((d) => `${d.id}=${d.title}`).join("; ") || "none";
  const snap = `SNAPSHOT
Drafts: news[${f(a)}] events[${f(e)}] lessons[${f(l)}] recognition[${f(r)}] library[${f(rs)}]
Pending members: ${pm.data?.map((m) => `${m.email} (${m.full_name ?? "no name"}, ${m.membership_type ?? "no type"})`).join("; ") || "none"}
New messages: ${msgs.data?.map((m) => `${m.id}: ${m.name}: ${String(m.message).slice(0, 120)}`).join(" | ") || "none"}
Media (newest): ${media.data?.map((m) => `${m.id}=${m.kind}:${m.title}`).join("; ") || "none"}
Site content: ${JSON.stringify({ hero: s.hero, about: s.about, membership: s.membership }).slice(0, 1800)}`;
  try {
    const raw = await askAssistant(clean, `${SYSTEM}\n\n${snap}`);
    try { const j = JSON.parse(raw.replace(/```json|```/g, "").trim()); return NextResponse.json({ reply: j.reply ?? "Done.", actions: Array.isArray(j.actions) ? j.actions : [] }); }
    catch { return NextResponse.json({ reply: raw, actions: [] }); }
  } catch { return NextResponse.json({ reply: "The AI is unavailable right now. Check the OpenRouter key in Netlify.", actions: [] }); }
}
