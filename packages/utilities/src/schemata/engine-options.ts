import * as v from "valibot";

export const jscodeshiftOptionsSchema = v.object({
  engine: v.literal("jscodeshift"),
  parser: v.union([
    v.literal("babel"),
    v.literal("babylon"),
    v.literal("flow"),
    v.literal("ts"),
    v.literal("tsx"),
  ]),
});

export const engineOptionsSchema = v.union([jscodeshiftOptionsSchema]);

export type EngineOptions = v.InferOutput<typeof engineOptionsSchema>;

export const parseEngineOptions = (
  input: unknown,
): v.InferOutput<typeof engineOptionsSchema> | null => {
  const options = v.safeParse(engineOptionsSchema, input);

  if (!options.success) {
    return null;
  }

  return options.output;
};
