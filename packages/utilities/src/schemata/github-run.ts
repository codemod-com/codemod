import * as v from "valibot";

export const codemodRunBodySchema = v.object({
  codemodSource: v.string(),
  codemodEngine: v.union([v.literal("jscodeshift"), v.literal("ts-morph")]),
  repoUrl: v.string(),
  branch: v.optional(v.string()),
});

export type CodemodRunResponse = { success: boolean; codemodRunId: string };

export const validateCodemodStatusParamsSchema = v.object({
  jobId: v.string(),
});
