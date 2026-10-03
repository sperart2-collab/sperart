"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
export default function AuthForm({ initial }: { initial: "signin" | "signup" }) {
  const [mode, setMode] = useState(initial);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg("");
    const f = new FormData(e.currentTarget), email = String(f.get("email")), password = String(f.get("password"));
    const sb = supabaseBrowser();
    if (mode === "signin") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message); else { router.push("/admin"); router.refresh(); }
    } else {
      const { error } = await sb.auth.signUp({ email, password });
      setMsg(error ? error.message : "Account created. Check your email to confirm, then sign in.");
    }
    setBusy(false);
  }
  return (
    <main className="grid min-h-screen place-items-center bg-bone p-5">
      <div className="w-full max-w-sm rounded-3xl border border-blue/20 bg-white p-7 shadow-[0_0_40px_rgba(30,91,255,.15)]">
        <a href="/" className="mx-auto block w-fit"><img src="/emblem.png" alt="SPERART" className="h-16" /></a>
        <div className="mt-6 grid grid-cols-2 rounded-full bg-bone p-1 text-sm font-medium">
          {(["signin", "signup"] as const).map((m) => <button key={m} onClick={() => { setMode(m); setMsg(""); }} className={`rounded-full py-2 transition ${mode === m ? "bg-blue text-white shadow-[0_0_14px_rgba(30,91,255,.5)]" : ""}`}>{m === "signin" ? "Sign in" : "Join as member"}</button>)}
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm">Email<input name="email" type="email" required autoComplete="email" className="field mt-1" /></label>
          <label className="block text-sm">Password<input name="password" type="password" required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} className="field mt-1" /></label>
          <button disabled={busy} className="btn btn-blue w-full">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
          {msg && <p role="alert" className="text-sm text-ink/80">{msg}</p>}
        </form>
        <a href="/" className="mt-5 block text-center text-sm text-ink/60 underline">Back to home</a>
      </div>
    </main>
  );
}
