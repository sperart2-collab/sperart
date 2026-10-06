export default function SperartMark({ size = "md", label = true }: { size?: "sm" | "md" | "lg"; label?: boolean }) {
  const box = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return <div className="flex items-center gap-3">
    <span className={`${box} sperart-mark grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#D8A63B]/70 bg-[#07162F]`}><img src="/emblem.png" alt="SPERART" className="h-full w-full object-cover" /></span>
    {label && <span className="sperart-wordmark"><strong>SPERART</strong><small>Preserve · Learn · Create · Grow</small></span>}
  </div>;
}
