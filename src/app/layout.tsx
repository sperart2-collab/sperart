import "./globals.css";
import type { Metadata } from "next";
import Splash from "@/components/Splash";
import CookieBanner from "@/components/CookieBanner";
import Spar from "@/components/Spar";
export const metadata: Metadata = { title: "SPERART", description: "Percussion, rhythm, culture and music education." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="font-sans antialiased"><Splash />{children}<Spar /><CookieBanner /></body></html>;
}
