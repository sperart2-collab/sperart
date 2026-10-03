import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/settings";
/** Standard inner-page layout: header, centered content, footer. */
export default async function Shell({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (<main><Header solid /><div className="mx-auto max-w-5xl px-5 pb-24 pt-32 md:px-8">{children}</div><Footer c={s.contact} /></main>);
}
