export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Loading">
      <div className="flex gap-2">{[0, 1, 2].map((i) => <span key={i} className="h-3 w-3 animate-bounce rounded-full bg-blue" style={{ animationDelay: `${i * 120}ms` }} />)}</div>
    </div>
  );
}
