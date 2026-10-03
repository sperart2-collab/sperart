import type { AiProvider, AiMessage } from "./types";
import { anthropicProvider } from "./providers/anthropic";
import { openrouterProvider } from "./providers/openrouter";
const providers: Record<string, AiProvider> = { anthropic: anthropicProvider, openrouter: openrouterProvider };
/** Add new providers to the map above; nothing else in the app changes. */
export function getAiProvider(): AiProvider {
  const p = providers[process.env.AI_PROVIDER ?? "anthropic"];
  if (!p) throw new Error("Unknown AI_PROVIDER");
  return p;
}
export const ASSISTANT_SYSTEM = "You help the SPERART administrator draft content. You only suggest. You never claim to have published or changed anything.";
export const askAssistant = (messages: AiMessage[], system: string = ASSISTANT_SYSTEM) => getAiProvider().complete(system, messages);
