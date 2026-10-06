"use client";
import { usePathname } from "next/navigation";
import Spar from "./Spar";
import WhatsApp from "./WhatsApp";
import CookieBanner from "./CookieBanner";
import ScrollButtons from "./ScrollButtons";
/** Floating public widgets. Hidden inside the admin so they never cover admin buttons. */
export default function SiteChrome({ whatsapp }: { whatsapp: string }) {
  if (usePathname()?.startsWith("/admin")) return null;
  return (<><ScrollButtons /><WhatsApp number={whatsapp} /><Spar /><CookieBanner /></>);
}
