import * as v from "valibot";

const codemodToRunBaseSchema = v.object({
  engine: v.union([
    v.literal("jscodeshift"),
    v.literal("ts-morph"),
    v.literal("workflow"),
  ]),
  args: v.optional(v.record(v.string(), v.any())),
});

export const codemodRunBodySchema = v.object({
  codemods: v.array(
    v.union([
      v.object({
        ...codemodToRunBaseSchema.entries,
        name: v.string(),
      }),
      v.object({
        ...codemodToRunBaseSchema.entries,
        source: v.string(),
      }),
    ]),
  ),
  repoUrl: v.optional(v.string()),
  branch: v.optional(v.string()),
  persistent: v.optional(v.boolean()),
});

export type CodemodRunBody = v.InferInput<typeof codemodRunBodySchema>;

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

export type GetExecutionStatusRequest = Readonly<{
  token?: string | null;
  executionId?: string | null;
}>;

export type CodemodRunRequest = {
  codemodEngine: "jscodeshift" | "ts-morph";
  repoUrl: string;
  codemodSource: string;
  codemodName: string;
  branch: string;
};
