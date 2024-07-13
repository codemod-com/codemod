import { knownEnginesSchema } from "@codemod-com/utilities";
import { type Output, any, array, object, parse, string } from "valibot";

export const editorsSnippetsSchema = object({
  name: string(),
  before: string(),
  after: string(),
});
export const editorsArraySchemata = array(editorsSnippetsSchema);
const stateSchema = object({
  engine: knownEnginesSchema,
  editors: editorsArraySchemata,
  codemodSource: string(),
});

export type State = Output<typeof stateSchema>;

export const parseState = (input: unknown) => parse(stateSchema, input);
