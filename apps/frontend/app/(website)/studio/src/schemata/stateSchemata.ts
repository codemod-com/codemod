import { knownEnginesSchema } from "@codemod-com/utilities";
import {
  type InferOutput,
  array,
  object,
  optional,
  parse,
  string,
} from "valibot";

export const editorsSnippetsSchema = object({
  name: string(),
  before: string(),
  after: string(),
  output: optional(string()),
});
export const editorsArraySchemata = array(editorsSnippetsSchema);
const stateSchema = object({
  engine: knownEnginesSchema,
  editors: editorsArraySchemata,
  codemodSource: string(),
});

export type State = InferOutput<typeof stateSchema>;

export const parseState = (input: unknown) => parse(stateSchema, input);
