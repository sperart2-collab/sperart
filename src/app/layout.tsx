import "./globals.css";
import type { Metadata } from "next";
import Splash from "@/components/Splash";
import CookieBanner from "@/components/CookieBanner";
import Spar from "@/components/Spar";
import WhatsApp from "@/components/WhatsApp";
import { getSettings } from "@/lib/settings";
import { site } from "@/config/site";
const desc = "SPERART, the Society of Percussive Art: percussion music, rhythm education, performance, research and community.";
export const metadata: Metadata = {
  metadataBase: new URL("https://sperart.org"),
  title: { default: "SPERART | Society of Percussive Art", template: "%s | SPERART" },
  description: desc,
  authors: [{ name: site.developer.name }],
  creator: site.developer.name,
  openGraph: { title: "SPERART | Society of Percussive Art", description: desc, url: "https://sperart.org", siteName: "SPERART", images: ["/logo.png"], type: "website" },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const ld = { "@context": "https://schema.org", "@type": "Organization", name: "SPERART", alternateName: "Society of Percussive Art", url: "https://sperart.org", logo: "https://sperart.org/logo.png", email: s.contact.email, telephone: s.contact.phone };
  return (
    <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: 'try{if(localStorage.getItem("sp-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}' }} /></head><body className="font-sans antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "SPERART", url: "https://sperart.org", creator: { "@type": "Person", name: site.developer.name, ...(site.developer.url ? { url: site.developer.url } : {}) } }) }} />
      <Splash />{children}<WhatsApp number={s.contact.whatsapp} /><Spar /><CookieBanner />
    </body></html>
  );
}
