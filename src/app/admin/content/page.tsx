import { sections } from "@/config/content";
import { getSettings } from "@/lib/settings";
import { saveSection } from "../actions";
import SubmitButton from "@/components/SubmitButton";
export const dynamic = "force-dynamic";
export default async function Content({ searchParams }: { searchParams: { saved?: string } }) {
  const s = (await getSettings()) as Record<string, Record<string, string>>;
  const saved = searchParams.saved;
  return (
    <>
      <h1 className="text-3xl font-semibold">Edit website content</h1>
      {saved && <p role="status" className="mt-4 rounded-xl border border-gold bg-white p-3">{saved === "error" ? "Could not save. Check that you are signed in as admin." : "Saved. The website is updated."}</p>}
      {Object.entries(sections).map(([key, sec]) => (
        <form key={key} action={saveSection} className="card mt-6 space-y-3">
          <input type="hidden" name="_key" value={key} />
          <h2 className="text-xl font-semibold text-blue">{sec.label}</h2>
          {sec.fields.map(([name, label, kind]) => (
            <label key={name} className="block text-sm">{label}
              {kind === "area" ? <textarea name={name} defaultValue={s[key][name]} rows={4} className="field mt-1" /> : <input name={name} defaultValue={s[key][name]} className="field mt-1" />}
            </label>
          ))}
          <SubmitButton>Save</SubmitButton>
        </form>
      ))}
    </>
  );
}
