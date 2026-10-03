import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings, lines, cols } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = { title: "About", description: "About the Society of Percussive Art (SPERART): story, mission, vision and leadership." };
export default async function About() {
  const s = await getSettings();
  return (
    <main>
      <Header solid />
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">About SPERART</h1>
        <p className="mt-2 text-blue">Society of Percussive Art</p>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink/80">{s.about.story}</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <section className="card"><h2 className="text-xl font-semibold text-blue">Mission</h2><p className="mt-2 whitespace-pre-line text-ink/80">{s.about.mission}</p></section>
          <section className="card"><h2 className="text-xl font-semibold text-blue">Vision</h2><p className="mt-2 whitespace-pre-line text-ink/80">{s.about.vision}</p></section>
        </div>
        <h2 className="mt-16 text-3xl font-semibold">Leadership</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lines(s.leadership.people).map((l, i) => {
            const [n, r, p] = cols(l);
            return (
              <div key={i} className="card text-center">
                {p ? <img src={p} alt={n} className="mx-auto h-28 w-28 rounded-full object-cover" /> : <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-bone text-3xl text-blue">{n?.[0]}</div>}
                <h3 className="mt-3 font-semibold">{n}</h3><p className="text-sm text-ink/70">{r}</p>
              </div>
            );
          })}
        </div>
      </div>
      <Footer c={s.contact} />
    </main>
  );
}
