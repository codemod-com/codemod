import { literal, object, optional, string, union } from "valibot";

export const codemodRunBodySchema = object({
  codemodSource: string(),
  codemodName: string(),
  codemodEngine: union([literal("jscodeshift"), literal("ts-morph")]),
  repoUrl: string(),
  branch: optional(string()),
});

export type CodemodRunResponse = { success: boolean; codemodRunId: string };

export const validateCodemodStatusParamsSchema = object({
  jobId: string(),
});
