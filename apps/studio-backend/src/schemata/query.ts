import {
	Output,
	boolean,
	coerce,
	literal,
	number,
	object,
	optional,
	parse,
	string,
	union,
} from "valibot";

export const getCodemodsQuerySchema = object({
	featured: optional(coerce(boolean(), (input) => input === "true")),
	verified: optional(coerce(boolean(), (input) => input === "true")),
	private: optional(coerce(boolean(), (input) => input === "true")),
});
export type GetCodemodsQuery = Output<typeof getCodemodsQuerySchema>;
export const parseGetCodemodsQuery = (input: unknown) =>
	parse(getCodemodsQuerySchema, input);

export const getCodemodBySlugParamsSchema = object({
	slug: string(),
});
export type GetCodemodBySlug = Output<typeof getCodemodBySlugParamsSchema>;
export const parseGetCodemodBySlugParams = (input: unknown) =>
	parse(getCodemodBySlugParamsSchema, input);
