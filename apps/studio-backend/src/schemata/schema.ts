import * as S from "@effect/schema/Schema";

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
