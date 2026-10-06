import { getSettings, lines } from "@/lib/settings";
import { supabaseServer } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import PerformanceTeaser from "@/components/PerformanceTeaser";
import { site } from "@/config/site";
import Header from "@/components/Header";
import Particles from "@/components/Particles";
import ScrollFx from "@/components/ScrollFx";
import VideoPlaylist from "@/components/VideoPlaylist";
export const revalidate = 60;
const words = ["Percussion", "Rhythm", "Culture", "Education", "Performance", "Community", "Research"];
const what = [
  ["Percussion education", "Lessons from first strike to advanced technique."],
  ["Performances", "Live shows and recorded sessions."],
  ["Workshops", "Hands-on sessions for all ages."],
  ["Cultural preservation", "Keeping rhythm traditions alive."],
  ["Youth programs", "Opening the door for young players."],
  ["Research", "Studying rhythm and its heritage."],
];
export default async function Home() {
  const s = await getSettings();
  const { data: academyLessons } = await supabaseServer().from("lessons").select("slug,title,summary,level").eq("status", "published").order("created_at", { ascending: false }).limit(9);
  const h = s.hero;
  const vids = lines(h.videos).length ? lines(h.videos) : site.heroVideos;
  return (
    <main>
      <ScrollFx /><Header />
      <section className="relative flex min-h-[85svh] items-end overflow-hidden bg-navy md:min-h-[90svh]">
        <div className="hero-vid absolute inset-0"><VideoPlaylist sources={vids} /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy/25" />
        <Particles />
        <div className="hero-copy relative max-w-4xl px-5 pb-24 text-white md:px-12 md:pb-32">
          <p className="rise text-gold">Welcome to sperart.org</p>
          <h1 className="rise neon-hero mt-3 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl" style={{ animationDelay: ".15s" }}>{h.title ?? "Rhythm is our language."}</h1>
          <p className="rise mt-6 max-w-xl text-lg text-white/85" style={{ animationDelay: ".3s" }}>{h.subtitle ?? "Percussion, culture and music education. Learn, listen and take part."}</p>
          <div className="rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: ".45s" }}>
            <a href={h.cta_href ?? "#what"} className="btn btn-blue">{h.cta_label ?? "Explore SPERART"}</a>
            <button data-open-spar className="btn btn-line">Ask Spar</button>
          </div>
        </div>
      </section>
      <div className="marquee" aria-hidden><div>{[...words, ...words, ...words, ...words].map((w, i) => <span key={i}>{w}<i>✦</i></span>)}</div></div>
      <section id="what" className="px-5 py-24 md:px-12">
        <h2 className="reveal text-4xl font-semibold tracking-tight md:text-6xl">What we do</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {what.map(([t, d], i) => <article key={t} className="card reveal" style={{ transitionDelay: `${(i % 3) * 120}ms` }}><h3 className="text-xl font-semibold text-blue">{t}</h3><p className="mt-2 text-ink/70">{d}</p></article>)}
        </div>
      </section>
      <section id="about" className="bg-bone px-5 py-24 md:px-12">
        <div className="reveal max-w-3xl"><h2 className="text-4xl font-semibold tracking-tight md:text-6xl">About SPERART</h2><p className="mt-6 text-lg leading-relaxed text-ink/80">{s.about.mission}</p><a href="/about" className="btn btn-blue mt-8">Mission, vision and leadership</a></div>
      </section>
      <PerformanceTeaser />
      <section className="px-5 py-24 md:px-12">
        <h2 className="reveal text-4xl font-semibold tracking-tight md:text-6xl">Academy</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {["Beginner", "Intermediate", "Advanced"].map((level, i) => {
            const lesson = (academyLessons ?? []).find((x) => x.level === level);
            return <a key={level} href={lesson ? `/academy/${lesson.slug}` : "/academy"} className="card reveal block transition hover:-translate-y-1" style={{ transitionDelay: `${i * 120}ms` }}>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-blue">{level}</p>
              <h3 className="mt-2 text-xl font-semibold">{lesson?.title ?? `${level} percussion studies`}</h3>
              <p className="mt-2 text-ink/70">{lesson?.summary ?? "Technique, rhythm reading, practice and musical development."}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-blue">Explore level →</span>
            </a>;
          })}
        </div>
        <div className="reveal mt-10 flex flex-wrap gap-4"><a href="/academy" className="btn btn-blue">Explore the Academy</a><a href="/join" className="btn border border-gold">Become a member</a></div>
      </section>
      <Footer c={s.contact} />
    </main>
  );
}
