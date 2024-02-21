import * as S from "@effect/schema/Schema";

export const environmentSchema = S.struct({
	PORT: S.string,
	DATA: S.optional(S.string),
	X_CODEMOD_ACCESS_TOKEN: S.optional(S.string),
	X_INTUITA_ACCESS_TOKEN: S.optional(S.string),
	CLERK_DISABLED: S.optional(S.literal("true")),
	// unused start
	ENCRYPTION_KEY: S.optional(S.string),
	SIGNATURE_PRIVATE_KEY: S.optional(S.string),
	PEPPER: S.optional(S.string),
	AWS_ACCESS_KEY_ID: S.optional(S.string),
	AWS_SECRET_ACCESS_KEY: S.optional(S.string),
	DATABASE_URI: S.optional(S.string),
	// unused end
	OPEN_AI_API_KEY: S.optional(S.string),
	CHROMA_BACKEND_URL: S.optional(S.string),
	CLAUDE_API_KEY: S.optional(S.string),
	CLERK_PUBLISH_KEY: S.optional(S.string),
	CLERK_SECRET_KEY: S.optional(S.string),
	CLERK_JWT_KEY: S.optional(S.string),
	REPLICATE_API_KEY: S.optional(S.string),
});

export type Environment = S.Schema.To<typeof environmentSchema>;

export const parseEnvironment = S.parseSync(environmentSchema);

const engineSchema = S.union(
	S.literal("gpt-4"),
	S.literal("claude-2.0"),
	S.literal("claude-instant-1.2"),
	S.literal("replit-code-v1-3b"),
	S.literal("gpt-4-with-chroma"),
);

export const sendMessageBodySchema = S.struct({
	message: S.string,
	parentMessageId: S.optional(S.string),
});

export const parseSendMessageBody = S.parseSync(sendMessageBodySchema);

export const sendChatBodySchema = S.struct({
	messages: S.array(
		S.struct({
			content: S.string,
			role: S.union(
				S.literal("system"),
				S.literal("user"),
				S.literal("assistant"),
			),
			name: S.optional(S.string),
		}),
	),
	engine: S.optional(engineSchema).withDefault(() => "gpt-4"),
});

export const parseSendChatBody = S.parseSync(sendChatBodySchema);

export const createIssueParamsSchema = S.struct({
	provider: S.literal("github"),
});

export const parseCreateIssueParams = S.parseSync(createIssueParamsSchema);

export const createIssueBodySchema = S.struct({
	repo: S.string,
	title: S.string,
	body: S.string,
});

export const parseCreateIssueBody = S.parseSync(createIssueBodySchema);
