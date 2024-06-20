import {
	array,
	boolean,
	coerce,
	literal,
	number,
	object,
	optional,
	parse,
	string,
	union,
} from 'valibot';

let engineSchema = union([
	literal('gpt-4'),
	literal('claude-2.0'),
	literal('claude-instant-1.2'),
	literal('replit-code-v1-3b'),
	literal('gpt-4-with-chroma'),
]);

let clientIdentifierSchema = union([
	literal('WEBSITE'),
	literal('STUDIO'),
	literal('VSCE'),
	literal('CLI'),
]);

export let parseClientIdentifierSchema = (input: unknown) =>
	parse(clientIdentifierSchema, input);

export let sendMessageBodySchema = object({
	message: string(),
	parentMessageId: optional(string()),
});

export let parseSendMessageBody = (input: unknown) =>
	parse(sendMessageBodySchema, input);

export let sendChatBodySchema = object({
	messages: array(
		object({
			content: string(),
			role: union([
				literal('system'),
				literal('user'),
				literal('assistant'),
			]),
			name: optional(string()),
		}),
	),
	engine: optional(engineSchema, 'gpt-4'),
});

export let parseSendChatBody = (input: unknown) =>
	parse(sendChatBodySchema, input);

export let providerSchema = object({
	provider: literal('github'),
});

export let parseCreateIssueParams = (input: unknown) =>
	parse(providerSchema, input);

export let createIssueBodySchema = object({
	repo: string(),
	title: string(),
	body: string(),
});

export let parseCreateIssueBody = (input: unknown) =>
	parse(createIssueBodySchema, input);

export let parseGetUserRepositoriesParams = (input: unknown) =>
	parse(providerSchema, input);

export let getCodemodsQuerySchema = object({
	search: optional(coerce(string(), String)),
	category: optional(union([string(), array(string())])),
	author: optional(union([string(), array(string())])),
	framework: optional(union([string(), array(string())])),
	verified: optional(coerce(boolean(), (input) => input === 'true')),
	page: optional(coerce(number(), Number)),
	size: optional(coerce(number(), Number)),
});

export let parseGetCodemodsQuery = (input: unknown) =>
	parse(getCodemodsQuerySchema, input);

export let getCodemodBySlugParamsSchema = object({
	slug: string(),
});

export let parseGetCodemodBySlugParams = (input: unknown) =>
	parse(getCodemodBySlugParamsSchema, input);

export let getCodemodLatestVersionQuerySchema = object({
	name: string(),
});

export let parseGetCodemodLatestVersionQuery = (input: unknown) =>
	parse(getCodemodLatestVersionQuerySchema, input);

export let listCodemodsQuerySchema = object({
	search: optional(string()),
});

export let parseListCodemodsQuery = (input: unknown) =>
	parse(listCodemodsQuerySchema, input);

export let validateIntentParamsSchema = object({
	id: string(),
});

export let parseValidateIntentParams = (input: unknown) =>
	parse(validateIntentParamsSchema, input);

export let buildAccessTokenQuerySchema = object({
	sessionId: optional(string()),
	iv: optional(string()),
});

export let parseBuildAccessTokenQuery = (input: unknown) =>
	parse(buildAccessTokenQuerySchema, input);

export let ivObjectSchema = object({
	iv: string(),
});

export let parseIv = (input: unknown) => parse(ivObjectSchema, input);

export let diffCreationBodySchema = object({
	before: string(),
	after: string(),
	source: union([literal('cli'), literal('studio')]),
	name: optional(string(), 'untitled'),
});

export let parseDiffCreationBody = (input: unknown) =>
	parse(diffCreationBodySchema, input);

export let getCodeDiffSchema = object({
	id: string(),
});

export let parseGetCodeDiffParams = (input: unknown) =>
	parse(getCodeDiffSchema, input);

export let unpublishBodySchema = object({
	name: string(),
});

export let parseUnpublishBody = (input: unknown) =>
	parse(unpublishBodySchema, input);
