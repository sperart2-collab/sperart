export type AiMessage = { role: "user" | "assistant"; content: string };
export interface AiProvider { name: string; complete(system: string, messages: AiMessage[]): Promise<string>; }
/** Anything the AI wants to change is stored as a proposal. Only an admin approval executes it. */
export type AiProposal = { kind: string; summary: string; payload: Record<string, unknown>; requiresConfirmation: boolean };
