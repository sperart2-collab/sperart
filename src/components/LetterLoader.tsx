/** SPERART letters fly in, join, then dissolve, on repeat. */
export default function LetterLoader({ small = false }: { small?: boolean }) {
  return (
    <div className="text-center" role="status" aria-label="Loading SPERART">
      <p className={`${small ? "neon-blue text-3xl" : "neon-letters text-5xl md:text-7xl"} font-semibold tracking-[.22em]`}>
        {"SPERART".split("").map((c, i) => <span key={i} className="ltr" style={{ animationDelay: `${i * 0.09}s` }}>{c}</span>)}
      </p>
      <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded bg-blue/15"><div className="load-bar h-full" /></div>
    </div>
  );
}
