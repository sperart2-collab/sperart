import AdminAssistant from "@/components/AdminAssistant";
export default function Assistant() {
  return (<><h1 className="text-3xl font-semibold">AI assistant</h1><p className="mt-2 text-ink/70">Full control is enabled by default. Safe admin actions run immediately; destructive deletes still require confirmation.</p><AdminAssistant /></>);
}
