import Shell from "@/components/Shell";
import { getSettings } from "@/lib/settings";
export const metadata = { title: "Privacy" };
export default async function Privacy() {
  const s = await getSettings();
  return (
    <Shell><div className="mx-auto max-w-3xl space-y-4 leading-relaxed text-ink/85">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
      <p className="text-sm text-ink/60">Draft summary. SPERART should have it reviewed before relying on it.</p>
      <p>We collect what you give us: your email, name, phone and membership choice when you create an account; the details you submit when you register for an event; and messages you send to the admin, including through Spar.</p>
      <p>We use essential cookies to keep you signed in. Questions typed into Spar are processed by an AI service to produce an answer.</p>
      <p>Your data is stored with our hosting providers (Supabase for the database and files, Netlify for the website). We do not sell your data.</p>
      <p>To ask about or remove your data, contact us at {s.contact.email}.</p>
    </div></Shell>
  );
}
