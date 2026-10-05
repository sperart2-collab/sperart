"use client";
import { useState } from "react";
export default function NewsletterForm() {
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    const r = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    setMsg(r.ok ? "Thank you. You are subscribed." : "That did not work. Check your email and try again.");
    if (r.ok) e.currentTarget.reset();
  }
  return (
    <form onSubmit={submit} className="mt-10 max-w-md">
      <p className="font-semibold">Get news and events by email</p>
      <div className="mt-3 flex gap-2"><input name="email" type="email" required placeholder="Your email" aria-label="Email" className="field !bg-white/10 !text-white placeholder:text-white/50" /><button className="btn btn-blue !px-5">Join</button></div>
      {msg && <p role="status" className="mt-2 text-sm text-white/80">{msg}</p>}
    </form>
  );
}
