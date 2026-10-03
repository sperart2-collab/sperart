import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings, lines, cols } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = { title: "Membership", description: "Join the Society of Percussive Art as an individual, student, group or organization." };
export default async function Membership() {
  const s = await getSettings();
  return (
    <main>
      <Header solid />
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Membership</h1>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {lines(s.membership.tiers).map((l, i) => {
            const [t, price, d] = cols(l);
            return (
              <article key={i} className="card flex flex-col">
                <h2 className="text-xl font-semibold text-blue">{t}</h2>
                <p className="mt-1 text-2xl font-semibold">{price}</p>
                <p className="mt-3 flex-1 text-ink/75">{d}</p>
                <a href="/join" className="btn btn-blue mt-6">Join as {t?.toLowerCase()}</a>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-sm text-ink/60">Online payment is coming soon. Create your account now and contact us to complete your membership.</p>
      </div>
      <Footer c={s.contact} />
    </main>
  );
}
