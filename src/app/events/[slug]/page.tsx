import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
import { fmt } from "@/lib/format";
import { registerForEvent } from "../actions";
export const dynamic = "force-dynamic";
const get = (slug: string) => supabaseServer().from("events").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await get(params.slug);
  return data ? { title: data.title, description: data.description?.slice(0, 150) } : {};
}
export default async function EventPage({ params, searchParams }: { params: { slug: string }; searchParams: { registered?: string } }) {
  const { data: e } = await get(params.slug);
  if (!e) notFound();
  const upcoming = new Date(e.starts_at).getTime() >= Date.now();
  return (
    <Shell><div className="mx-auto max-w-3xl">
      <p className="text-blue">{fmt(e.starts_at)}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{e.title}</h1>
      {e.location && <p className="mt-2 text-ink/70">{e.location}</p>}
      {e.cover_url && <img src={e.cover_url} alt="" className="mt-8 w-full rounded-2xl" />}
      <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-ink/85">{e.description}</div>
      {upcoming && (
        <form action={registerForEvent} className="card mt-10 space-y-3">
          <h2 className="text-xl font-semibold text-blue">Register</h2>
          <input type="hidden" name="slug" value={e.slug} /><input type="hidden" name="event_id" value={e.id} />
          <input name="name" required placeholder="Full name" className="field" />
          <input name="email" type="email" required placeholder="Email" className="field" />
          <input name="phone" placeholder="Phone (optional)" className="field" />
          <button className="btn btn-blue">Register</button>
          {searchParams.registered === "1" && <p role="status" className="text-sm">You are registered. We will be in touch.</p>}
          {searchParams.registered === "error" && <p role="alert" className="text-sm text-red-600">Could not register. Check your details and try again.</p>}
        </form>
      )}
    </div></Shell>
  );
}
