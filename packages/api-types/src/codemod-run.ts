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

const statusBaseSchema = v.object({
  // job id
  id: v.string(),
  // name
  codemod: v.string(),
  // progress from CLI ?
  progress: v.number(),
});

export const codemodRunStatusSchema = v.union([
  v.object({
    ...statusBaseSchema.entries,
    status: v.union([v.literal("progress"), v.literal("error")]),
    message: v.string(),
  }),
  v.object({
    ...statusBaseSchema.entries,
    status: v.literal("executing codemod"),
    progress: v.object({
      processed: v.number(),
      total: v.number(),
    }),
  }),
  v.object({
    ...statusBaseSchema.entries,
    status: v.literal("done"),
    link: v.string(),
  }),
]);

export type CodemodRunStatusInput = v.InferInput<typeof codemodRunStatusSchema>;
export type CodemodRunStatus = v.InferOutput<typeof codemodRunStatusSchema>;

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
