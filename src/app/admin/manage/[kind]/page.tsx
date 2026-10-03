import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { kinds } from "@/config/manage";
import { saveRecord, deleteRecord } from "../../records";
import ConfirmDelete from "@/components/ConfirmDelete";
export const dynamic = "force-dynamic";
export default async function Manage({ params, searchParams }: { params: { kind: string }; searchParams: { edit?: string; saved?: string; error?: string } }) {
  const k = kinds[params.kind];
  if (!k) notFound();
  const { data } = await supabaseServer().from(k.table).select("*").order("created_at", { ascending: false });
  const cur = data?.find((r) => r.id === searchParams.edit);
  const val = (n: string, t?: string) => {
    const v = cur?.[n];
    if (!v) return "";
    return t === "datetime" ? new Date(v).toLocaleString("sv-SE", { timeZone: "Africa/Lagos" }).replace(" ", "T").slice(0, 16) : v;
  };
  return (
    <>
      <h1 className="text-3xl font-semibold">{k.label}</h1>
      {searchParams.saved && <p role="status" className="mt-4 rounded-xl border border-gold bg-white p-3">Saved.</p>}
      {searchParams.error && <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-white p-3">Could not save. Check that the database update was run.</p>}
      <form key={cur?.id ?? "new"} action={saveRecord} className="card mt-6 space-y-3">
        <input type="hidden" name="_kind" value={params.kind} /><input type="hidden" name="_id" value={cur?.id ?? ""} />
        <h2 className="text-xl font-semibold text-blue">{cur ? "Edit" : "Add new"}</h2>
        {k.fields.map(([name, label, type]) => (
          <label key={name} className="block text-sm">{label}
            {type === "status" ? <select name={name} defaultValue={val(name) || "draft"} className="field mt-1"><option value="draft">Draft (hidden)</option><option value="published">Published</option></select>
              : type?.startsWith("opts:") ? <select name={name} defaultValue={val(name) || type.slice(5).split(",")[0]} className="field mt-1">{type.slice(5).split(",").map((o) => <option key={o}>{o}</option>)}</select>
              : type?.startsWith("area") ? <textarea name={name} defaultValue={val(name)} rows={type === "area-lg" ? 10 : 3} className="field mt-1" />
              : <input name={name} type={type === "datetime" ? "datetime-local" : "text"} defaultValue={val(name, type)} className="field mt-1" />}
          </label>
        ))}
        <div className="flex gap-3"><button className="btn btn-blue">Save</button>{cur && <a href={`/admin/manage/${params.kind}`} className="btn border border-gold">Cancel</a>}</div>
      </form>
      <div className="mt-8 space-y-3">
        {data?.map((r) => (
          <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
            <div><p className="font-semibold">{r.title}</p><p className="text-sm text-ink/60">{r.status === "published" ? "Published" : "Draft"}</p></div>
            <div className="flex items-center gap-4 text-sm">
              <a className="underline" href={`/admin/manage/${params.kind}?edit=${r.id}`}>Edit</a>
              <form action={deleteRecord}><input type="hidden" name="_kind" value={params.kind} /><input type="hidden" name="_id" value={r.id} /><ConfirmDelete /></form>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
