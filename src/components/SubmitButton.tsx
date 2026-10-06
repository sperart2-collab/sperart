"use client";
import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, pending = "Saving…", className = "btn btn-blue" }: { children: React.ReactNode; pending?: string; className?: string }) {
  const { pending: busy } = useFormStatus();
  return <button type="submit" disabled={busy} aria-disabled={busy} className={`${className} disabled:cursor-wait disabled:opacity-60`}>{busy ? pending : children}</button>;
}
