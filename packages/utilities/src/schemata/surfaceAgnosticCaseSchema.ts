import { type Output, bigint, object, parse, string } from 'valibot';
import { argumentRecordSchema } from './argumentRecordSchema.js';

let surfaceAgnosticCaseSchema = object({
	caseHashDigest: string(),
	codemodHashDigest: string(),
	createdAt: bigint(),
	absoluteTargetPath: string(),
	argumentRecord: argumentRecordSchema,
});

export let parseSurfaceAgnosticCase = (input: unknown) =>
	parse(surfaceAgnosticCaseSchema, input);

export type SurfaceAgnosticCase = Output<typeof surfaceAgnosticCaseSchema>;
