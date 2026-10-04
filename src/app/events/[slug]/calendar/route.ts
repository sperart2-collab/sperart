import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
/** Downloads an .ics calendar file for a published event (assumes a 2 hour duration). */
export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { data: e } = await supabaseServer().from("events").select("title,description,location,starts_at,slug").eq("slug", params.slug).eq("status", "published").maybeSingle();
  if (!e) return new Response("Not found", { status: 404 });
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);
  const start = new Date(e.starts_at), end = new Date(start.getTime() + 2 * 3600 * 1000);
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SPERART//EN", "BEGIN:VEVENT", `UID:${e.slug}@sperart.org`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:${esc(e.title)}`, `LOCATION:${esc(e.location ?? "")}`, `DESCRIPTION:${esc((e.description ?? "").slice(0, 500))}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return new Response(body, { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="${e.slug}.ics"` } });
}
