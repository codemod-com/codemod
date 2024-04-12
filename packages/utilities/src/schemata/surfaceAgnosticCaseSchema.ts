import { bigint, object, parse, string, type Output } from "valibot";
import { argumentRecordSchema } from "./argumentRecordSchema.js";

const surfaceAgnosticCaseSchema = object({
	caseHashDigest: string(),
	codemodHashDigest: string(),
	createdAt: bigint(),
	absoluteTargetPath: string(),
	argumentRecord: argumentRecordSchema,
});

export const parseSurfaceAgnosticCase = (input: unknown) =>
	parse(surfaceAgnosticCaseSchema, input);

export type SurfaceAgnosticCase = Output<typeof surfaceAgnosticCaseSchema>;
