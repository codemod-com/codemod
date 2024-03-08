import {
	Output,
	boolean,
	coerce,
	object,
	optional,
	parse,
	string,
} from "valibot";

export const getCodemodsQuerySchema = object({
	featured: optional(coerce(boolean(), (input) => input === "true")),
	verified: optional(coerce(boolean(), (input) => input === "true")),
	private: optional(coerce(boolean(), (input) => input === "true")),
	page: optional(coerce(number(), Number)),
	size: optional(coerce(number(), Number)),
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
