import {
	Output,
	coerce,
	literal,
	number,
	object,
	optional,
	parse,
	string,
} from "valibot";

export const environmentSchema = object({
	PORT: coerce(number(), (input) => Number(input)),
	DATA: optional(string()),
	X_CODEMOD_ACCESS_TOKEN: optional(string()),
	X_INTUITA_ACCESS_TOKEN: optional(string()),
	CLERK_DISABLED: optional(literal("true")),
	// unused start
	ENCRYPTION_KEY: optional(string()),
	SIGNATURE_PRIVATE_KEY: optional(string()),
	PEPPER: optional(string()),
	AWS_ACCESS_KEY_ID: optional(string()),
	AWS_SECRET_ACCESS_KEY: optional(string()),
	DATABASE_URI: string(),
	// unused end
	OPEN_AI_API_KEY: optional(string()),
	CHROMA_BACKEND_URL: optional(string()),
	CLAUDE_API_KEY: optional(string()),
	CLERK_PUBLISH_KEY: optional(string()),
	CLERK_SECRET_KEY: optional(string()),
	CLERK_JWT_KEY: optional(string()),
	REPLICATE_API_KEY: optional(string()),
});

export type Environment = Output<typeof environmentSchema>;

export const parseEnvironment = (input: unknown) =>
	parse(environmentSchema, input);
