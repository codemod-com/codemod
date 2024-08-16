import * as v from "valibot";

export const codemodRunBodySchema = v.object({
  codemods: v.object({
    source: v.string(),
    name: v.string(),
    engine: v.union([
      v.literal("jscodeshift"),
      v.literal("ts-morph"),
      v.literal("workflow"),
    ]),
  }),
  repoUrl: v.optional(v.string()),
  branch: v.optional(v.string()),
  persistent: v.optional(v.boolean()),
});

export type CodemodRunResponse = { success: boolean; codemodRunId: string };

export const validateCodemodStatusParamsSchema = v.object({
  ids: v.array(v.string()),
});

export const codemodRunStatusSchema = v.union([
  v.object({
    status: v.union([v.literal("progress"), v.literal("error")]),
    message: v.string(),
  }),
  v.object({
    status: v.literal("executing codemod"),
    progress: v.object({
      processed: v.number(),
      total: v.number(),
    }),
  }),
  v.object({
    status: v.literal("done"),
    link: v.string(),
  }),
]);

export type CodemodRunStatusInput = v.InferInput<typeof codemodRunStatusSchema>;
export type CodemodRunStatus = v.InferOutput<typeof codemodRunStatusSchema>;
