export let llmEngines = ['gpt-4-turbo', 'gpt-4', 'gpt-4o'] as const;

export type LLMEngine = (typeof llmEngines)[number];
