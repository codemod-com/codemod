import {
	array,
	boolean,
	coerce,
	number,
	object,
	optional,
	parse,
	string,
	union,
} from "valibot";

export const getCodemodsQuerySchema = object({
	search: optional(coerce(string(), String)),
	category: optional(union([string(), array(string())])),
	author: optional(union([string(), array(string())])),
	framework: optional(union([string(), array(string())])),
	verified: optional(coerce(boolean(), (input) => input === "true")),
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

export const validateIntentParamsSchema = object({
	id: string(),
});

export const parseValidateIntentParams = (input: unknown) =>
	parse(validateIntentParamsSchema, input);

export const buildAccessTokenQuerySchema = object({
	sessionId: optional(string()),
	iv: optional(string()),
});

export const parseBuildAccessTokenQuery = (input: unknown) =>
	parse(buildAccessTokenQuerySchema, input);

export const ivObjectSchema = object({
	iv: string(),
});

export const parseIv = (input: unknown) => parse(ivObjectSchema, input);
