import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import Metronome from "@/components/Metronome";
import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const get = (slug: string) => supabaseServer().from("lessons").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await get(params.slug);
  return data ? { title: data.title, description: data.summary ?? undefined } : {};
}
export default async function Lesson({ params }: { params: { slug: string } }) {
  const { data: l } = await get(params.slug);
  if (!l) notFound();
  return (
    <Shell><div className="mx-auto max-w-3xl">
      <p className="text-blue">{l.category} · {l.level}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{l.title}</h1>
      {l.summary && <p className="mt-4 text-lg text-ink/75">{l.summary}</p>}
      {l.video_url && <video src={l.video_url} controls playsInline preload="metadata" className="mt-8 max-h-[70vh] w-full rounded-2xl bg-navy" />}
      {l.audio_url && <audio src={l.audio_url} controls preload="none" className="mt-6 w-full" />}
      {l.body && <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-ink/85">{l.body}</div>}
      <div className="mt-10"><Metronome /></div>
      <a href="/academy" className="btn btn-blue mt-10">All lessons</a>
    </div></Shell>
  );
}
