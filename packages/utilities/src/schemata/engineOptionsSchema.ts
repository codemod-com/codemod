import { type Output, literal, object, safeParse, union } from "valibot";

export const engineOptionsSchema = union([
  object({
    engine: literal("jscodeshift"),
    parser: union([
      literal("babel"),
      literal("babylon"),
      literal("flow"),
      literal("ts"),
      literal("tsx"),
    ]),
  }),
]);

export type EngineOptions = Output<typeof engineOptionsSchema>;

export const parseEngineOptions = (input: unknown) =>
  safeParse(engineOptionsSchema, input);
