import { knownEnginesSchema } from "@codemod-com/utilities";
import { type Output, object, parse, string } from "valibot";

let stateSchema = object({
  engine: knownEnginesSchema,
  beforeSnippet: string(),
  afterSnippet: string(),
  codemodSource: string(),
});

export type State = Output<typeof stateSchema>;

export let parseState = (input: unknown) => parse(stateSchema, input);
