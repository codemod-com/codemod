import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { literal, object, optional, parse, string, union } from "valibot";

const runArgvSettingsSchema = union([
  object({
    dry: optional(literal(false), false),
  }),
  object({
    dry: literal(true),
    output: optional(string()),
  }),
]);

export type RunSettings =
  | Readonly<{
      dryRun: false;
      caseHashDigest: Buffer;
    }>
  | Readonly<{
      dryRun: true;
      streamingEnabled: boolean;
      outputDirectoryPath: string;
      caseHashDigest: Buffer;
    }>;

export const parseRunSettings = (
  homeDirectoryPath: string,
  input: unknown,
): RunSettings => {
  const caseHashDigest = randomBytes(20);

  const flowSettings = parse(runArgvSettingsSchema, input);

  if (flowSettings.dry === false) {
    return {
      dryRun: false,
      caseHashDigest,
    };
  }

  const outputDirectoryPath = join(
    homeDirectoryPath,
    ".codemod",
    "cases",
    caseHashDigest.toString("base64url"),
  );

  return {
    dryRun: true,
    streamingEnabled: true,
    outputDirectoryPath,
    caseHashDigest,
  };
};
