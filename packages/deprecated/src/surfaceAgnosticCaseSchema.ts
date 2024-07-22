import { type Output, bigint, object, parse, string } from "valibot";
import { argumentRecordSchema } from "./argument-record.js";

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
