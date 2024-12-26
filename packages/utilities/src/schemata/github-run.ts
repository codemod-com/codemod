import * as v from "valibot";

export const codemodRunBodySchema = v.object({
  codemodSource: v.string(),
  codemodEngine: v.union([
    v.literal("jscodeshift"),
    v.literal("ts-morph"),
    v.literal("workflow"),
  ]),
  codemodArguments: v.optional(v.string()),
  repoUrl: v.optional(v.string()),
  branch: v.optional(v.string()),
  persistent: v.optional(v.boolean()),
});

export type CodemodRunResponse = { success: boolean; codemodRunId: string };

export const validateCodemodStatusParamsSchema = v.object({
  jobId: v.string(),
});
