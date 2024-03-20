import {
	boolean,
	coerce,
	number,
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
export const parseGetCodemodsQuery = (input: unknown) =>
	parse(getCodemodsQuerySchema, input);

export const getCodemodBySlugParamsSchema = object({
	slug: string(),
});
export const parseGetCodemodBySlugParams = (input: unknown) =>
	parse(getCodemodBySlugParamsSchema, input);

export const getCodemodLatestVersionQuerySchema = object({
	name: string(),
});
export const parseGetCodemodLatestVersionQuery = (input: unknown) =>
	parse(getCodemodLatestVersionQuerySchema, input);

export const listCodemodsQuerySchema = object({
	search: optional(string()),
});
export const parseListCodemodsQuery = (input: unknown) =>
	parse(listCodemodsQuerySchema, input);
