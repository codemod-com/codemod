export type LLMMessage = {
  content: string;
  role: "function" | "assistant" | "data" | "system" | "user";
  // id: string;
  codemod?: string;
  name?: string;
};

export type CodemodAIInput = {
  type: "generate_codemod" | "generate_test" | "refine_codemod";
  codemod_engine?: "jscodeshift";
  llm_engine?: "gpt-4" | "gpt-4o" | "gpt-4-turbo";
  attempts?: number;
  seed?: number;
  before: string[];
  after: string[];
  description: string;
  context: string;
};

export type CodemodAIProgressOutput = {
  execution_status: "in_progress";
  message: string;
};

export type CodemodAIErrorOutput = {
  execution_status: "error";
  message: string;
};

export type CodemodAIFinishedOutput = {
  execution_status: "finished";
  codemod: string;
};

export type CodemodAITestFinishedOutput = {
  execution_status: "finished";
  before: string[];
  after: string[];
};

export type CodemodAIOutput =
  | CodemodAIProgressOutput
  | CodemodAIErrorOutput
  | CodemodAIFinishedOutput
  | CodemodAITestFinishedOutput;
