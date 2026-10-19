
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { askAssistant } from "@/lib/ai/service";
import { getSettings } from "@/lib/settings";
import { kinds } from "@/config/manage";
import { sections } from "@/config/content";
import type { AiMessage } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

const SYSTEM = `
You are SPERART's autonomous administrative operator.
Respond naturally and use the supplied site snapshot.
You are an operator, not a narrator. When the user gives an instruction,
return executable actions in the same response. Never announce an action and
then omit the action from the JSON. Follow-up messages such as "go on",
"permission granted", "do so", "proceed", and "just do it" authorize the
most recent clearly stated pending plan; convert that plan into actions now.
For publishing, match the exact item titles and IDs in the snapshot and return
one set_status action per requested item. Do not ask for permission again when
the user has already explicitly approved. Never claim an action succeeded;
the application will show the actual execution result.

Return exactly one JSON object:
{"reply":"Your natural response","actions":[]}

Supported action types and arguments:
- create_draft: {kind,title,...fields supported by that kind}
- set_status: {kind,id,status:"draft"|"published"}
- approve_member: {email,status:"active"|"inactive"|"pending"}
- approve_pending_members: {status:"active"|"inactive"|"pending"}
- handle_message: {id}
- set_content: {section,field,value}
- add_hero_video: {media_id}
- delete_item: {kind,id}

Content kinds are exactly: news, events, lessons, recognition, library.
Use only IDs and media IDs present in the snapshot.
Never invent an ID or claim an action succeeded before execution.
For content creation, write polished, complete content.
Lessons should include objectives, technique, guided practice,
common mistakes and a practice assignment.
Create drafts unless publishing is explicitly requested.
Never invent event dates.
Only propose delete_item for an explicit deletion request.
If a required fact is missing and cannot be inferred, ask briefly
and return an empty actions array.
Do not include markdown fences or text outside the JSON object.
`;

type ProposedAction = {
  type: string;
  args: Record<string, unknown>;
};

const validStatuses = ["draft", "published"];
const memberStatuses = ["active", "inactive", "pending"];

function parseModel(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // Return a safe text-only response below.
      }
    }
  }

  return { reply: cleaned, actions: [] };
}

function validateAction(value: unknown): ProposedAction | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Record<string, unknown>;
  if (typeof item.type !== "string") return null;
  if (!item.args || typeof item.args !== "object" ||
      Array.isArray(item.args)) return null;

  const args = item.args as Record<string, unknown>;
  const str = (key: string) =>
    typeof args[key] === "string" ? String(args[key]).trim() : "";

  const kind = str("kind");

  switch (item.type) {
    case "create_draft": {
      const model = kinds[kind];
      if (!model || !str("title")) return null;

      const allowed = new Set(model.fields.map(([name]) => name));
      const safeArgs: Record<string, unknown> = { kind };

      for (const [key, val] of Object.entries(args)) {
        if (key === "kind" || key === "title") continue;
        if (!allowed.has(key) || key === "status") continue;
        if (typeof val !== "string" &&
            typeof val !== "number") continue;
        safeArgs[key] = val;
      }

      safeArgs.title = str("title");
      return { type: item.type, args: safeArgs };
    }

    case "set_status":
      if (!kinds[kind] || !str("id") ||
          !validStatuses.includes(str("status"))) return null;
      return {
        type: item.type,
        args: { kind, id: str("id"), status: str("status") },
      };

    case "delete_item":
      if (!kinds[kind] || !str("id")) return null;
      return { type: item.type, args: { kind, id: str("id") } };

    case "approve_member":
      if (!str("email") ||
          !memberStatuses.includes(str("status"))) return null;
      return {
        type: item.type,
        args: { email: str("email"), status: str("status") },
      };

    case "approve_pending_members":
      if (!memberStatuses.includes(str("status"))) return null;
      return {
        type: item.type,
        args: { status: str("status") },
      };

    case "handle_message":
      if (!str("id")) return null;
      return { type: item.type, args: { id: str("id") } };

    case "add_hero_video":
      if (!str("media_id")) return null;
      return {
        type: item.type,
        args: { media_id: str("media_id") },
      };

    case "set_content": {
      const section = str("section");
      const field = str("field");
      if (!sections[section as keyof typeof sections] ||
          !field || typeof args.value !== "string") return null;

      return {
        type: item.type,
        args: {
          section,
          field,
          value: args.value.slice(0, 12000),
        },
      };
    }

    default:
      return null;
  }
}


/**
 * Recover an explicitly approved publish operation if the model responds with
 * another promise instead of an executable action. Only exact draft titles
 * present in the database snapshot can be selected; IDs are never invented.
 */
function resolveApprovedPublishFollowUp(
  messages: AiMessage[],
  eventRows: { id: string; title: string | null }[] | null,
  lessonRows: { id: string; title: string | null }[] | null,
): ProposedAction[] {
  const latestUser = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const transcript = messages.map((message) => message.content).join("\n");
  const explicitPublish = /\bpublish\b/i.test(latestUser);
  const approvedContinuation = /\b(go on|go ahead|are (?:you|u) done|permission granted|do so|just do it|proceed|carry on|yes|approved)\b/i.test(latestUser);
  const priorPublishPlan = messages.some(
    (message) => message.role === "assistant" && /\b(publish|publishing|publish(?:ed|ing)?)\b/i.test(message.content),
  );

  if (!explicitPublish && !(approvedContinuation && priorPublishPlan)) return [];

  const transcriptLower = transcript.toLocaleLowerCase();
  const actions: ProposedAction[] = [];
  const seen = new Set<string>();

  for (const [kind, rows] of [
    ["events", eventRows],
    ["lessons", lessonRows],
  ] as const) {
    for (const row of rows ?? []) {
      const title = row.title?.trim();
      if (!title || !transcriptLower.includes(title.toLocaleLowerCase())) continue;
      const key = `${kind}:${row.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      actions.push({ type: "set_status", args: { kind, id: row.id, status: "published" } });
    }
  }

  return actions.slice(0, 8);
}

export async function POST(req: Request) {
  try {
    const sb = supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await sb.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { data: admin, error: adminError } = await sb
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const clean: AiMessage[] = body.messages
      .filter(
        (m: unknown) =>
          !!m &&
          typeof m === "object" &&
          ["user", "assistant"].includes(
            String((m as Record<string, unknown>).role),
          ) &&
          typeof (m as Record<string, unknown>).content === "string",
      )
      .slice(-12)
      .map((m: { role: "user" | "assistant"; content: string }) => ({
        role: m.role,
        content: m.content.slice(0, 1800),
      }));

    if (!clean.length) {
      return NextResponse.json({
        reply: "I'm ready. What should I handle?",
        actions: [],
      });
    }

    const draftList = async (table: string) =>
      sb.from(table).select("id,title").eq("status", "draft").limit(12);

    const [
      news,
      events,
      lessons,
      recognition,
      library,
      pending,
      inquiries,
      media,
      settings,
    ] = await Promise.all([
      draftList("articles"),
      draftList("events"),
      draftList("lessons"),
      draftList("recognitions"),
      draftList("resources"),
      sb.from("profiles")
        .select("user_id,email,full_name,membership_type,status")
        .eq("status", "pending")
        .limit(20),
      sb.from("inquiries")
        .select("id,name,email,message,status,created_at")
        .eq("status", "new")
        .limit(10),
      sb.from("media")
        .select("id,kind,title,path")
        .order("created_at", { ascending: false })
        .limit(20),
      getSettings(),
    ]);

    const list = (result: {
      data: { id: string; title: string | null }[] | null;
    }) =>
      result.data?.map((item) => `${item.id}=${item.title}`).join("; ")
      || "none";

    const snapshot = `
SITE SNAPSHOT
Draft news: ${list(news)}
Draft events: ${list(events)}
Draft lessons: ${list(lessons)}
Draft recognition: ${list(recognition)}
Draft library: ${list(library)}

Pending members:
${pending.data?.map((m) =>
  `${m.email} (${m.full_name || "no name"}, ${m.membership_type || "no type"})`
).join("; ") || "none"}

New inquiries:
${inquiries.data?.map((m) =>
  `${m.id}: ${m.name} <${m.email}>: ${String(m.message).slice(0, 180)}`
).join(" | ") || "none"}

Recent media:
${media.data?.map((m) =>
  `${m.id}=${m.kind}:${m.title || "untitled"}`
).join("; ") || "none"}

Website settings:
${JSON.stringify({
  hero: settings.hero,
  about: settings.about,
  leadership: settings.leadership,
  membership: settings.membership,
  contact: settings.contact,
  faq: settings.faq,
}).slice(0, 7000)}
`;

    const raw = await askAssistant(clean, `${SYSTEM}\n${snapshot}`);
    const parsed = parseModel(String(raw ?? ""));
    const result = parsed as Record<string, unknown>;

    let actions = Array.isArray(result.actions)
      ? result.actions
          .map(validateAction)
          .filter((a): a is ProposedAction => a !== null)
          .slice(0, 8)
      : [];

    // If the model only narrated an already-approved publishing plan, execute
    // the exact matching draft records rather than sending another promise.
    if (!actions.length) {
      actions = resolveApprovedPublishFollowUp(clean, events.data, lessons.data);
    }

    const reply =
      typeof result.reply === "string" && result.reply.trim()
        ? result.reply.trim().slice(0, 6000)
        : "I've reviewed your request.";

    return NextResponse.json({ reply, actions });
  } catch (error) {
    console.error("SPERART admin assistant failed:", error);
    return NextResponse.json(
      {
        error: "The SPERART assistant is temporarily unavailable.",
        actions: [],
      },
      { status: 500 },
    );
  }
}
