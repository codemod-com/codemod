import { number, object, type Output } from "valibot";

export const offsetRangeSchema = object({
	start: number(),
	end: number(),
});

export type OffsetRange = Output<typeof offsetRangeSchema>;
