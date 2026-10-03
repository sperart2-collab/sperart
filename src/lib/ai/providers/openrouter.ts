import type { AiProvider } from "../types";
/** OpenRouter (OpenAI-compatible). Key lives in OPENROUTER_API_KEY, server-side only. */
export const openrouterProvider: AiProvider = {
  name: "openrouter",
  async complete(system, messages) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      body: JSON.stringify({ model: process.env.AI_MODEL, max_tokens: 1000, messages: [{ role: "system", content: system }, ...messages] }),
    });
    if (!res.ok) throw new Error(`AI provider error ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  },
};
