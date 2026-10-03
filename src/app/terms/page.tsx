import Shell from "@/components/Shell";
export const metadata = { title: "Terms" };
export default function Terms() {
  return (
    <Shell><div className="mx-auto max-w-3xl space-y-4 leading-relaxed text-ink/85">
      <h1 className="text-4xl font-semibold tracking-tight">Terms of use</h1>
      <p className="text-sm text-ink/60">Draft summary. SPERART should have it reviewed before relying on it.</p>
      <p>The content on this website, including videos, photos, lessons and text, belongs to SPERART or its contributors. Please do not copy or republish it without permission.</p>
      <p>Memberships are confirmed by the SPERART admin. Event details can change. Spar is an automated assistant and may be wrong, so check important details with the admin.</p>
    </div></Shell>
  );
}
