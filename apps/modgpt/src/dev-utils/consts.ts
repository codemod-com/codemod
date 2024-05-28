import { llmEngines } from "../../../shared";

export const port = process?.env?.PORT || "9999";
export const engines = llmEngines;
export const roles = ["system", "user", "assistant", "function"];
