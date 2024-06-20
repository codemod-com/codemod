import { type Output, number, object } from "valibot";

export let offsetRangeSchema = object({
  start: number(),
  end: number(),
});

export type OffsetRange = Output<typeof offsetRangeSchema>;
