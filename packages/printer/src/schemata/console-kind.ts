import * as v from "valibot";

export const consoleKindSchema = v.union([
  v.literal("debug"),
  v.literal("error"),
  v.literal("log"),
  v.literal("info"),
  v.literal("trace"),
  v.literal("warn"),
]);

export const parseConsoleKind = (input: unknown) =>
  v.parse(consoleKindSchema, input);

export type ConsoleKind = v.InferOutput<typeof consoleKindSchema>;
