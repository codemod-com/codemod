import * as v from "valibot";

export const codemodObjectSchema = v.object({
  engine: v.union([
    v.literal("jscodeshift"),
    v.literal("ts-morph"),
    v.literal("workflow"),
  ]),
  name: v.string(),
  source: v.optional(v.string()),
  args: v.optional(v.record(v.string(), v.any())),
});

export const codemodRunBodySchema = v.object({
  codemods: v.array(codemodObjectSchema),
  repoUrl: v.optional(v.string()),
  branch: v.optional(v.string()),
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

export type CodemodRunStatusInput = v.InferInput<typeof codemodRunStatusSchema>;
export type CodemodRunStatus = v.InferOutput<typeof codemodRunStatusSchema>;
export const codemodRunStatusSchema = v.object({
  // job id
  id: v.string(),
  // progress from CLI
  progress: executionProgressSchema,
  codemod: codemodObjectSchema,
  status: v.union([
    v.literal("progress"),
    v.literal("error"),
    v.literal("done"),
  ]),
  data: v.optional(v.string()),
});

export type CodemodRunJobData = {
  userId: string;
  engine: "jscodeshift" | "ts-morph" | "workflow";
  repoUrl?: string;
  branch?: string;
  createPullRequest?: boolean;
  name: string;
  source?: string;
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
