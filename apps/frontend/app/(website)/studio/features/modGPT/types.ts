import type { LLMEngine } from "@codemod-com/utilities";

export type LLMMessage = {
  content: string;
  role: "function" | "assistant" | "data" | "system" | "user";
  id: string;
  codemod?: string;
  name?: string;
};

export type CodemodAIInput = {
  config: { llm_engine: LLMEngine; generate_test?: boolean };
  previous_context: LLMMessage[];
  before: string[];
  after: string[];
};

export type CodemodAIOutput =
  | {
      execution_status: "in-progress" | "error";
      message: string;
    }
  // Finished generating codemod
  | {
      execution_status: "finished";
      codemod: string;
    }
  // Finished generating test case
  | {
      execution_status: "finished";
      before: string[];
      after: string[];
    };
