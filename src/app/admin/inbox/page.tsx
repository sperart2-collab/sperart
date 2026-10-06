import { supabaseServer } from "@/lib/supabase/server";
import { markHandled, replyToMember, sendEmailReply } from "./actions";
import SubmitButton from "@/components/SubmitButton";
export const dynamic = "force-dynamic";
export default async function Inbox({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  const sb = supabaseServer();
  const [{ data: inquiries }, { data: webMessages }, { data: people }] = await Promise.all([
    sb.from("inquiries").select("*").order("created_at", { ascending: false }).limit(100),
    sb.from("member_messages").select("id,sender_id,recipient_id,body,created_at,read_at").order("created_at", { ascending: false }).limit(100),
    sb.from("profiles").select("user_id,email,full_name").limit(500),
  ]);
  const person = new Map((people ?? []).map((p) => [p.user_id, p]));
  return <>
    <h1 className="text-3xl font-semibold">Messages</h1>
    <p className="mt-2 text-ink/60">Reply by email for a normal email response, or reply inside a member's SPERART account.</p>{searchParams.sent && <p role="status" className="mt-4 rounded-xl border border-gold bg-white p-3">{searchParams.sent === "email" ? "Email sent successfully." : "Member reply sent successfully."}</p>}{searchParams.error && <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-white p-3">{searchParams.error}</p>}
    <section className="mt-7 space-y-4">
      <h2 className="text-xl font-semibold">Contact messages</h2>
      {!inquiries?.length && <p className="text-ink/70">No contact messages yet.</p>}
      {inquiries?.map((m) => {
        const member = (people ?? []).find((p) => p.email?.toLowerCase() === m.email?.toLowerCase());
        return <article key={m.id} className="card">
          <p className="font-semibold">{m.name} <span className="font-normal text-ink/60">{m.email}</span></p>
          <p className="mt-2 whitespace-pre-line">{m.message}</p>
          <p className="mt-3 text-sm text-ink/60">{new Date(m.created_at).toLocaleString()} · {m.status === "new" ? "New" : "Handled"}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="btn btn-blue !px-4 !py-2" href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to SPERART")}`}>Open email app</a>
            {m.status === "new" && <form action={markHandled}><input type="hidden" name="id" value={m.id} /><SubmitButton className="btn border border-gold !px-4 !py-2" pending="Updating…">Mark handled</SubmitButton></form>}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <form action={sendEmailReply} className="rounded-2xl border border-blue/10 bg-bone p-4">
              <input type="hidden" name="to" value={m.email} /><input type="hidden" name="subject" value="Re: your message to SPERART" />
              <p className="font-semibold">Reply by email</p><p className="mt-1 text-xs text-ink/60">Uses Resend when your Resend key is configured.</p><textarea name="body" required rows={4} className="field mt-3" placeholder="Write your email reply…" /><div className="mt-3"><SubmitButton className="btn btn-blue !px-4 !py-2" pending="Sending email…">Send email</SubmitButton></div>
            </form>
            {member ? <form action={replyToMember} className="rounded-2xl border border-gold bg-bone p-4"><input type="hidden" name="email" value={member.email} /><p className="font-semibold">Reply in SPERART</p><p className="mt-1 text-xs text-ink/60">The member gets it in their notification bell and Messages area.</p><textarea name="body" required rows={4} className="field mt-3" placeholder="Write your member reply…" /><div className="mt-3"><SubmitButton className="btn btn-blue !px-4 !py-2" pending="Sending…">Send in member account</SubmitButton></div></form> : <div className="rounded-2xl border border-blue/10 bg-bone p-4"><p className="font-semibold">Reply in SPERART</p><p className="mt-1 text-sm text-ink/60">This sender does not have a member account yet, so only email reply is available.</p></div>}
          </div>
        </article>;
      })}
    </section>
    <section className="mt-10 space-y-4">
      <h2 className="text-xl font-semibold">Member account messages</h2>
      {!webMessages?.length && <p className="text-ink/70">No account messages yet.</p>}
      {webMessages?.map((m) => { const sender = person.get(m.sender_id); const recipient = person.get(m.recipient_id); return <article key={m.id} className="card"><p className="font-semibold">{sender?.full_name || sender?.email || "Member"} <span className="font-normal text-ink/50">→ {recipient?.full_name || recipient?.email || "Member"}</span></p><p className="mt-2 whitespace-pre-line">{m.body}</p><p className="mt-3 text-sm text-ink/60">{new Date(m.created_at).toLocaleString()}</p></article>; })}
    </section>
  </>;
}
