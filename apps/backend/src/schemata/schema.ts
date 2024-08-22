import {
  codemodRunBodySchema,
  validateCodemodStatusParamsSchema,
} from "@codemod-com/api-types";

import {
  array,
  boolean,
  custom,
  literal,
  object,
  optional,
  parse,
  pipe,
  string,
  transform,
  union,
} from "valibot";

const engineSchema = union([
  literal("gpt-4"),
  literal("claude-2.0"),
  literal("claude-instant-1.2"),
  literal("replit-code-v1-3b"),
  literal("gpt-4-with-chroma"),
]);

const clientIdentifierSchema = union([
  literal("WEBSITE"),
  literal("STUDIO"),
  literal("VSCE"),
  literal("CLI"),
]);

export const queryParamBooleanSchema = pipe(
  custom((input) => input === "true" || input === "false"),
  transform((input) => input === "true"),
  boolean(),
);

export const parseClientIdentifierSchema = (input: unknown) =>
  parse(clientIdentifierSchema, input);

export const sendMessageBodySchema = object({
  message: string(),
  parentMessageId: optional(string()),
});

export const parseSendMessageBody = (input: unknown) =>
  parse(sendMessageBodySchema, input);

export const sendChatBodySchema = object({
  messages: array(
    object({
      content: string(),
      role: union([literal("system"), literal("user"), literal("assistant")]),
      name: optional(string()),
    }),
  ),
  engine: optional(engineSchema, "gpt-4"),
});

export const parseSendChatBody = (input: unknown) =>
  parse(sendChatBodySchema, input);

export const providerSchema = object({
  provider: literal("github"),
});

export const parseCreateIssueParams = (input: unknown) =>
  parse(providerSchema, input);

export const createIssueBodySchema = object({
  repoUrl: string(),
  title: string(),
  body: string(),
});

export const parseCreateIssueBody = (input: unknown) =>
  parse(createIssueBodySchema, input);

export const parseGetUserRepositoriesParams = (input: unknown) =>
  parse(providerSchema, input);

export const getRepoBranchesBodySchema = object({
  repoUrl: string(),
});

export const parseGetRepoBranchesBody = (input: unknown) =>
  parse(getRepoBranchesBodySchema, input);
export const parseGetRepoBranchesParams = (input: unknown) =>
  parse(providerSchema, input);

export const paginatedQuerySchema = object({
  page: optional(pipe(string(), transform(Number))),
  size: optional(pipe(string(), transform(Number))),
});
export const parsePaginatedGetQuery = (input: unknown) =>
  parse(paginatedQuerySchema, input);

export const getCodemodsQuerySchema = object({
  search: optional(string()),
  category: optional(union([string(), array(string())])),
  author: optional(union([string(), array(string())])),
  framework: optional(union([string(), array(string())])),
  verified: optional(queryParamBooleanSchema),
  page: optional(pipe(string(), transform(Number))),
  size: optional(pipe(string(), transform(Number))),
});

export const parseGetCodemodsQuery = (input: unknown) =>
  parse(getCodemodsQuerySchema, input);

export const getCodemodParamsSchema = object({
  criteria: string(),
});

export const parseGetCodemodBySlugParams = (input: unknown) =>
  parse(getCodemodParamsSchema, input);

export const getCodemodLatestVersionQuerySchema = object({
  name: string(),
});

export const parseGetCodemodLatestVersionQuery = (input: unknown) =>
  parse(getCodemodLatestVersionQuerySchema, input);

export const listCodemodsQuerySchema = object({
  search: optional(string()),
  mine: optional(queryParamBooleanSchema),
  all: optional(queryParamBooleanSchema),
});

export const parseListCodemodsQuery = (input: unknown) =>
  parse(listCodemodsQuerySchema, input);

export const validateIntentParamsSchema = object({
  id: string(),
});

export const parseValidateIntentParams = (input: unknown) =>
  parse(validateIntentParamsSchema, input);

export const ivObjectSchema = object({
  iv: string(),
});

export const parseIv = (input: unknown) => parse(ivObjectSchema, input);

export const diffCreationBodySchema = object({
  before: string(),
  after: string(),
  source: union([literal("cli"), literal("studio")]),
  name: optional(string(), "untitled"),
});

export const parseDiffCreationBody = (input: unknown) =>
  parse(diffCreationBodySchema, input);

export const getCodeDiffSchema = object({
  id: string(),
});

export const parseGetCodeDiffParams = (input: unknown) =>
  parse(getCodeDiffSchema, input);

export const unpublishBodySchema = object({
  name: string(),
});

export const parseUnpublishBody = (input: unknown) =>
  parse(unpublishBodySchema, input);

export const parseCodemodRunBody = (input: unknown) =>
  parse(codemodRunBodySchema, input);

export const parseCodemodStatusParams = (input: unknown) =>
  parse(validateCodemodStatusParamsSchema, input);
