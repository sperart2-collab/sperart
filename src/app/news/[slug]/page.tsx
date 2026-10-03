import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/Shell";
import { supabaseServer } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
const get = (slug: string) => supabaseServer().from("articles").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await get(params.slug);
  return data ? { title: data.title, description: data.excerpt ?? undefined } : {};
}
export default async function Article({ params }: { params: { slug: string } }) {
  const { data: a } = await get(params.slug);
  if (!a) notFound();
  return (
    <Shell><article className="mx-auto max-w-3xl">
      <p className="text-sm text-ink/60">{new Date(a.created_at).toLocaleDateString("en-NG", { dateStyle: "long" })}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{a.title}</h1>
      {a.cover_url && <img src={a.cover_url} alt="" className="mt-8 w-full rounded-2xl" />}
      <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-ink/85">{a.body}</div>
      <a href="/news" className="btn btn-blue mt-10">All news</a>
    </article></Shell>
  );
}
