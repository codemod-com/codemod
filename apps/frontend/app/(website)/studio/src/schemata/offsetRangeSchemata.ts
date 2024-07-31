import { type InferOutput, number, object } from "valibot";

export const offsetRangeSchema = object({
  start: number(),
  end: number(),
});

export type OffsetRange = InferOutput<typeof offsetRangeSchema>;
