import * as S from "@effect/schema/Schema";
import { argumentRecordSchema } from "./argumentRecordSchema.js";

const surfaceAgnosticCaseSchema = S.struct({
	caseHashDigest: S.string,
	codemodHashDigest: S.string,
	createdAt: S.bigint,
	absoluteTargetPath: S.string,
	argumentRecord: argumentRecordSchema,
});

export const parseSurfaceAgnosticCase = S.parseSync(surfaceAgnosticCaseSchema);

export type SurfaceAgnosticCase = S.Schema.To<typeof surfaceAgnosticCaseSchema>;
