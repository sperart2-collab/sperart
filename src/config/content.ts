import { site } from "./site";
/** Editable website content. Defaults show until the admin saves a section. All text here is PLACEHOLDER. */
export const defaults = {
  hero: { title: "Rhythm is our language.", subtitle: "Percussion, culture and music education. Learn, listen and take part.", cta_label: "Explore SPERART", cta_href: "#what", videos: "" },
  about: {
    mission: "[Placeholder] The SPERART mission statement goes here. Edit it in the admin under Edit content.",
    vision: "[Placeholder] The SPERART vision goes here.",
    story: "[Placeholder] The story of the Society of Percussive Art goes here.",
  },
  leadership: { people: "[Name] | [Role] | \n[Name] | [Role] | \n[Name] | [Role] | " },
  membership: {
    tiers: "Individual | [Price] | [Describe the benefits of individual membership]\nStudent | [Price] | [Describe the benefits of student membership]\nGroup | [Price] | [Describe the benefits of group membership]\nOrganization | [Price] | [Describe the benefits of organization membership]",
  },
  faq: { items: "" },
  contact: { address: site.contact.address, email: site.contact.email, phone: site.contact.phone, whatsapp: "2348027805802" },
};
type Field = [name: string, label: string, kind?: string];
export const sections: Record<string, { label: string; fields: Field[] }> = {
  hero: { label: "Homepage hero", fields: [["title", "Headline"], ["subtitle", "Subtitle", "area"], ["cta_label", "Button text"], ["cta_href", "Button link"], ["videos", "Hero videos: one link per line (add them from Media). Empty uses the built-in videos.", "area"]] },
  about: { label: "About, mission and vision", fields: [["story", "Our story", "area"], ["mission", "Mission", "area"], ["vision", "Vision", "area"]] },
  leadership: { label: "Leadership", fields: [["people", "One person per line: Name | Role | Photo link (photo optional)", "area"]] },
  membership: { label: "Membership types and prices", fields: [["tiers", "One per line: Type | Price | Description | Amount in naira, digits only (turns on online payment)", "area"]] },
  faq: { label: "FAQ (shown on the Events page)", fields: [["items", "One per line: Question | Answer", "area"]] },
  contact: { label: "Contact details", fields: [["address", "Address"], ["email", "Email"], ["phone", "Phone"], ["whatsapp", "WhatsApp number with country code, e.g. 2348027805802"]] },
};
