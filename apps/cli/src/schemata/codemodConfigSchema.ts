import {
	type Output,
	array,
	literal,
	object,
	optional,
	string,
	union,
} from "valibot";
import { argumentsSchema } from "./argumentsSchema.js";

const optionalArgumentsSchema = optional(argumentsSchema, []);

const PIRANHA_LANGUAGES = [
	"java",
	"kt",
	"go",
	"py",
	"swift",
	"ts",
	"tsx",
	"scala",
] as const;

const piranhaLanguageSchema = union(
	PIRANHA_LANGUAGES.map((language) => literal(language)),
);

export const codemodConfigSchema = union([
	object({
		schemaVersion: literal("1.0.0"),
		engine: literal("piranha"),
		language: piranhaLanguageSchema,
		arguments: optionalArgumentsSchema,
	}),
	object({
		schemaVersion: literal("1.0.0"),
		engine: literal("jscodeshift"),
		arguments: optionalArgumentsSchema,
	}),
	object({
		schemaVersion: literal("1.0.0"),
		engine: literal("ts-morph"),
		arguments: optionalArgumentsSchema,
	}),
	object({
		schemaVersion: literal("1.0.0"),
		engine: union([literal("repomod-engine"), literal("filemod")]),
		arguments: optionalArgumentsSchema,
	}),
	object({
		schemaVersion: literal("1.0.0"),
		engine: literal("recipe"),
		names: array(string()),
		arguments: optionalArgumentsSchema,
	}),
	object({
		schemaVersion: literal("1.0.0"),
		engine: literal("ast-grep"),
		arguments: optionalArgumentsSchema,
	}),
]);

export type CodemodConfig = Output<typeof codemodConfigSchema>;
