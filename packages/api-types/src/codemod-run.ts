import * as v from "valibot";

export const codemodRunBodySchema = v.object({
  codemods: v.array(
    v.object({
      engine: v.union([
        v.literal("jscodeshift"),
        v.literal("ts-morph"),
        v.literal("workflow"),
      ]),
      name: v.string(),
      source: v.optional(v.string()),
      args: v.optional(v.record(v.string(), v.any())),
    }),
  ),
  repoUrl: v.optional(v.string()),
  branch: v.optional(v.string()),
  persistent: v.optional(v.boolean()),
});

export type CodemodRunBody = v.InferInput<typeof codemodRunBodySchema>;

export const validateCodemodStatusParamsSchema = v.object({
  ids: v.array(v.string()),
});

export type ExecutionProgress = v.InferOutput<typeof executionProgressSchema>;
const executionProgressSchema = v.object({
  processed: v.number(),
  total: v.number(),
  percentage: v.number(),
});

export type CodemodRunStatusBase = v.InferOutput<typeof statusBaseSchema>;
export const statusBaseSchema = v.object({
  // job id
  id: v.string(),
  // name
  codemod: v.string(),
  // progress from CLI
  progress: executionProgressSchema,
});

export type CodemodProgress = v.InferOutput<typeof codemodProgressSchema>;
export const codemodProgressSchema = v.object({
  ...statusBaseSchema.entries,
  status: v.union([v.literal("progress"), v.literal("error")]),
  message: v.string(),
});

export type CodemodExecuting = v.InferOutput<typeof codemodExecutingSchema>;
export const codemodExecutingSchema = v.object({
  ...statusBaseSchema.entries,
  status: v.literal("executing codemod"),
});

export type CodemodDone = v.InferOutput<typeof codemodDoneSchema>;
export const codemodDoneSchema = v.object({
  ...statusBaseSchema.entries,
  status: v.literal("done"),
});

export type CodemodRunStatusInput = v.InferInput<typeof codemodRunStatusSchema>;
export type CodemodRunStatus = v.InferOutput<typeof codemodRunStatusSchema>;
export const codemodRunStatusSchema = v.union([
  codemodProgressSchema,
  codemodExecutingSchema,
  codemodDoneSchema,
]);

export type CodemodRunJobData = {
  userId: string;
  codemodEngine: "jscodeshift" | "ts-morph" | "workflow";
  repoUrl?: string;
  branch?: string;
  createPullRequest?: boolean;
  codemodName: string;
  codemodSource?: string;
  persistent?: boolean;
};

export type CodemodRunRequestPayload = Omit<CodemodRunJobData, "userId">;

// export type GetExecutionStatusRequest = Readonly<{
//   token?: string | null;
//   executionId?: string | null;
// }>;
export type CodemodRunResponse = {
  success: true;
  data: { jobId: string; codemodName: string }[];
};
export type CodemodRunStatusResponse = {
  success: true;
  data: CodemodRunStatus[];
};
