/** Emails the admin through Resend. Does nothing if RESEND_API_KEY / ADMIN_NOTIFY_EMAIL are not set. Never throws. */
export async function notifyAdmin(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY, to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.NOTIFY_FROM ?? "SPERART <onboarding@resend.dev>", to: [to], subject, text }),
    });
  } catch {}
}
