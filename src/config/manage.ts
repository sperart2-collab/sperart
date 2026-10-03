type Field = [name: string, label: string, kind?: string];
/** Admin-managed record types. Add a new entry to get a new editor at /admin/manage/<key>. */
export const kinds: Record<string, { table: string; label: string; fields: Field[] }> = {
  news: { table: "articles", label: "News", fields: [["title", "Title"], ["excerpt", "Short summary", "area"], ["cover_url", "Cover image link (copy from Media)"], ["body", "Article text", "area-lg"], ["status", "Status", "status"]] },
  events: { table: "events", label: "Events", fields: [["title", "Title"], ["starts_at", "Date and time (Lagos time)", "datetime"], ["location", "Location"], ["cover_url", "Cover image link (copy from Media)"], ["description", "Description", "area-lg"], ["status", "Status", "status"]] },
};
