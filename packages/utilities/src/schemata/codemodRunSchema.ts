import { literal, object, optional, string, union } from "valibot";

export const codemodRunBodySchema = object({
  userId: string(),
  codemodSource: string(),
  codemodEngine: union([literal("jscodeshift"), literal("ts-morph")]),
  repoUrl: string(),
  branch: optional(string()),
});

export type CodemodRunResponse = { success: boolean; codemodRunId: string };

export const validateCodemodStatusParamsSchema = object({
  jobId: string(),
});
