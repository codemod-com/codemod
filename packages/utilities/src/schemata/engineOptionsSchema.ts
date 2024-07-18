import { type Output, literal, object, safeParse, union } from "valibot";

export const jscodeshiftOptionsSchema = object({
  engine: literal("jscodeshift"),
  parser: union([
    literal("babel"),
    literal("babylon"),
    literal("flow"),
    literal("ts"),
    literal("tsx"),
  ]),
});

export const engineOptionsSchema = union([jscodeshiftOptionsSchema]);

export type EngineOptions = Output<typeof engineOptionsSchema>;

export const parseEngineOptions = (
  input: unknown,
): Output<typeof engineOptionsSchema> | null => {
  const options = safeParse(engineOptionsSchema, input);

  if (!options.success) {
    return null;
  }

  return options.output;
};
