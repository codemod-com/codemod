import { knownEnginesSchema } from "@codemod-com/utilities";
import { type Output, object, parse, string } from "valibot";

const stateSchema = object({
  engine: knownEnginesSchema,
  beforeSnippet: string(),
  afterSnippet: string(),
  codemodSource: string(),
});

export type State = Output<typeof stateSchema>;

export const parseState = (input: unknown) => parse(stateSchema, input);
