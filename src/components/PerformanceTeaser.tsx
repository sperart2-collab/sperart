import { latestVideos } from "@/lib/public";
import { storage } from "@/lib/storage";
/** Homepage strip: the three newest performance videos uploaded in Admin > Media. */
export default async function PerformanceTeaser() {
  const data = await latestVideos();
  if (!data.length) return null;
  return (
    <section className="bg-bone px-5 py-24 md:px-12">
      <h2 className="reveal text-4xl font-semibold tracking-tight md:text-6xl">Watch our performances</h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {data.map((v) => (
          <div key={v.id} className="card reveal !p-3">
            <video src={`${storage.publicUrl("media", v.path)}#t=0.5`} controls preload="metadata" playsInline className="aspect-[4/5] w-full rounded-lg bg-navy object-contain" />
            <p className="mt-2 truncate">{v.title}</p>
          </div>
        ))}
      </div>
      <a href="/media" className="btn btn-blue reveal mt-10">See all performances</a>
    </section>
  );
}
