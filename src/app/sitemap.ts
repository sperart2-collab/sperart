import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/membership", "/academy", "/recognition", "/library", "/privacy", "/terms", "/media", "/news", "/events", "/join"].map((p) => ({ url: `https://sperart.org${p}`, lastModified: new Date() }));
}
