import type { AiProvider } from "../types";
export const anthropicProvider: AiProvider = {
  name: "anthropic",
  async complete(system, messages) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.AI_MODEL, max_tokens: 1000, system, messages }),
    });
    if (!res.ok) throw new Error(`AI provider error ${res.status}`);
    const data = await res.json();
    return data.content.map((b: { text?: string }) => b.text ?? "").join("");
  },
};
