export const fmt = (d: string) => new Date(d).toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos" });
