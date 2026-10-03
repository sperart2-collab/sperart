export default function WhatsApp({ number }: { number: string }) {
  let n = number.replace(/\D/g, "");
  if (n.startsWith("0")) n = "234" + n.slice(1);
  if (!n) return null;
  return (
    <a href={`https://wa.me/${n}?text=${encodeURIComponent("Hello SPERART, I have a question.")}`} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-24 right-5 z-[70] rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-[0_0_24px_#25D366]">WhatsApp</a>
  );
}
