export const CODEMOD_STUDIO_URL = "https://codemod.com/studio";

export const llmEngines = ["gpt-4o", "gpt-4-turbo", "gpt-4"] as const;
export type LLMEngine = (typeof llmEngines)[number];
