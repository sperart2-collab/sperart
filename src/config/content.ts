import { site } from "./site";
/** Editable website content. Defaults are production-ready and remain active until the admin saves a section. */
export const defaults = {
  hero: { title: "Rhythm is our language.", subtitle: "Preserving percussion heritage, empowering artists and educating the next generation through rhythm.", cta_label: "Explore SPERART", cta_href: "#what", videos: "" },
  about: {
    mission: "Our mission is to preserve, celebrate, and advance the art of percussion by connecting people, cultures, and generations through rhythm. SPERART is dedicated to nurturing the next generation of percussionists, supporting artists and educators, preserving traditional musical heritage, and creating meaningful opportunities for learning, performance, research, and cultural exchange.",
    vision: "A world connected through rhythm — where every rhythm has a story, every tradition has a place, artists are supported, young people can learn, and communities can share their musical heritage with the world.",
    story: "SPERART was founded on a simple belief: rhythm is more than sound — it is heritage, identity, communication and connection. We are building a global platform for percussion education, preservation, research, performance and cultural exchange, connecting traditional practice with the possibilities of tomorrow.",
  },
  leadership: { people: "SPERART Leadership | Society of Percussive Art | " },
  membership: { tiers: "Individual | Membership | Join the SPERART community and access member updates, learning resources and opportunities\nStudent | Student membership | Learn, connect and grow with the SPERART community\nGroup | Group membership | Bring a percussion group, ensemble or learning community into SPERART\nOrganization | Organization membership | Connect your institution with percussion education, culture and research" },
  faq: { items: "What is SPERART? | SPERART is the Society of Percussive Art, dedicated to percussion education, performance, preservation, research and cultural exchange.\nWho can join? | Percussionists, educators, students, researchers, cultural practitioners and people who simply love rhythm are welcome.\nWhere can I learn? | Visit the Academy for lessons and rudiments from beginner to advanced." },
  contact: { address: site.contact.address, email: site.contact.email, phone: site.contact.phone, whatsapp: "2348027805802" },
};
type Field = [name: string, label: string, kind?: string];
export const sections: Record<string, { label: string; fields: Field[] }> = {
  hero: { label: "Homepage hero", fields: [["title", "Headline"], ["subtitle", "Subtitle", "area"], ["cta_label", "Button text"], ["cta_href", "Button link"], ["videos", "Hero videos: one link per line (add them from Media). Empty uses the built-in videos.", "area"]] },
  about: { label: "About, mission and vision", fields: [["story", "Our story", "area"], ["mission", "Mission", "area"], ["vision", "Vision", "area"]] },
  leadership: { label: "Leadership", fields: [["people", "One person per line: Name | Role | Photo link (photo optional)", "area"]] },
  membership: { label: "Membership types and prices", fields: [["tiers", "One per line: Type | Membership name | Description | Optional amount in naira, digits only", "area"]] },
  faq: { label: "FAQ", fields: [["items", "One per line: Question | Answer", "area"]] },
  contact: { label: "Contact details", fields: [["address", "Address"], ["email", "Email"], ["phone", "Phone"], ["whatsapp", "WhatsApp number with country code, e.g. 2348027805802"]] },
};
