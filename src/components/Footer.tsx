type C = { address: string; email: string; phone: string };
export default function Footer({ c }: { c: C }) {
  return (
    <footer id="contact" className="bg-navy px-5 py-16 text-white md:px-12">
      <div className="grid gap-10 md:grid-cols-3">
        <div><p className="font-semibold tracking-[.2em]">SPERART</p><p className="mt-2 text-white/70">Society of Percussive Art</p></div>
        <address className="space-y-2 not-italic text-white/85">
          <p>{c.address}</p>
          <p><a className="text-gold underline" href={`mailto:${c.email}`}>{c.email}</a></p>
          <p><a className="text-gold underline" href={`tel:${c.phone}`}>{c.phone}</a></p>
        </address>
        <nav className="flex flex-col gap-2 text-white/85"><a href="/about">About</a><a href="/membership">Membership</a><a href="/join">Join</a><a href="/login">Sign in</a></nav>
      </div>
      <p className="mt-12 text-sm text-white/50">© {new Date().getFullYear()} SPERART</p>
    </footer>
  );
}
