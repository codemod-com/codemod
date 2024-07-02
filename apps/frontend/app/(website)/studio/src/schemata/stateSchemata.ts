import { knownEnginesSchema } from "@codemod-com/utilities";
import { array, object, type Output, parse, string } from "valibot";

const stateSchema = object({
	engine: knownEnginesSchema,
	beforeSnippets: array(string()),
	afterSnippets: array(string()),
	codemodSource: string(),
});

export type State = Output<typeof stateSchema>;

export const parseState = (input: unknown) => parse(stateSchema, input);
