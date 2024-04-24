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
} from "valibot";

const engineSchema = union([
  literal("gpt-4"),
  literal("claude-2.0"),
  literal("claude-instant-1.2"),
  literal("replit-code-v1-3b"),
  literal("gpt-4-with-chroma"),
]);

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
  repo: string(),
  title: string(),
  body: string(),
});

export const parseCreateIssueBody = (input: unknown) =>
  parse(createIssueBodySchema, input);

export const parseGetUserRepositoriesParams = (input: unknown) =>
  parse(providerSchema, input);

export const getRepoBranchesBodySchema = object({
  id: number(),
  name: string(),
  full_name: string(),
  private: boolean(),
  html_url: string(),
  default_branch: string(),
  permissions: object({
    admin: boolean(),
    push: boolean(),
    pull: boolean(),
  }),
});

export const parseGetRepoBranchesBody = (input: unknown) =>
  parse(getRepoBranchesBodySchema, input);
export const parseGetRepoBranchesParams = (input: unknown) =>
  parse(providerSchema, input);

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
