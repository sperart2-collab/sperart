"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "@/components/Particles";
import { supabaseBrowser } from "@/lib/supabase/browser";
const score = (p: string) => [p.length >= 8, /[A-Z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
export default function AuthForm({ initial }: { initial: "signin" | "signup" }) {
  const [mode, setMode] = useState(initial);
  const [msg, setMsg] = useState(""), [ok, setOk] = useState(false), [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false), [pw, setPw] = useState(""), [shake, setShake] = useState(0);
  const router = useRouter();
  const fail = (m: string) => { setOk(false); setMsg(m); setShake((s) => s + 1); };
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg("");
    const email = String(new FormData(e.currentTarget).get("email")).trim(), sb = supabaseBrowser();
    if (mode === "signin") {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) fail(error.message === "Email not confirmed" ? "Please confirm your email first. Check your inbox." : error.message);
      else { router.push("/account"); router.refresh(); }
    } else {
      const { data, error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
      if (error) fail(error.message);
      else if (data.session) { router.push("/account"); router.refresh(); }
      else { setOk(true); setMsg("Account created. Check your email and click the link to confirm."); }
    }
    setBusy(false);
  }
  const st = score(pw);
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-bone p-5"><Particles />
      <div key={shake} className={`relative w-full max-w-sm rounded-3xl border border-blue/20 bg-white p-7 shadow-[0_0_50px_rgba(15,82,255,.18)] ${shake ? "shake" : ""}`}>
        <a href="/" className="mx-auto block w-fit"><img src="/emblem.png" alt="SPERART" className="h-16 drop-shadow-[0_0_14px_rgba(15,82,255,.45)]" /></a>
        <h1 className="mt-4 text-center text-2xl font-semibold">{mode === "signin" ? "Welcome back" : "Join SPERART"}</h1>
        <div className="mt-5 grid grid-cols-2 rounded-full bg-bone p-1 text-sm font-medium">
          {(["signin", "signup"] as const).map((m) => <button key={m} type="button" onClick={() => { setMode(m); setMsg(""); }} className={`rounded-full py-2 transition ${mode === m ? "bg-blue text-white shadow-[0_0_14px_rgba(15,82,255,.5)]" : ""}`}>{m === "signin" ? "Sign in" : "Join as member"}</button>)}
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm">Email<input name="email" type="email" required autoComplete="email" className="field mt-1" /></label>
          <label className="block text-sm">Password
            <span className="relative mt-1 block"><input value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} className="field !pr-16" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue" aria-label="Show or hide password">{show ? "Hide" : "Show"}</button></span>
          </label>
          {mode === "signup" && pw && <div aria-hidden className="flex gap-1">{[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full transition ${st >= n ? "bg-gold shadow-[0_0_8px_#FFC93C]" : "bg-clay"}`} />)}</div>}
          <button disabled={busy} className="btn btn-blue w-full">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
          {msg && <p role="alert" className={`text-sm ${ok ? "text-blue" : "text-red-600"}`}>{msg}</p>}
        </form>
        <a href="/" className="mt-5 block text-center text-sm text-ink/60 underline">Back to home</a>
      </div>
    </main>
  );
}
