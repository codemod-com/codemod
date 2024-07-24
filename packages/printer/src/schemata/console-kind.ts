import { type Output, literal, parse, union } from "valibot";

export const consoleKindSchema = union([
  literal("debug"),
  literal("error"),
  literal("log"),
  literal("info"),
  literal("trace"),
  literal("warn"),
]);

export const parseConsoleKind = (input: unknown) =>
  parse(consoleKindSchema, input);

export type ConsoleKind = Output<typeof consoleKindSchema>;
