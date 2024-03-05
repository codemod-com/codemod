import ms from "ms";
import {
	Output,
	array,
	boolean,
	coerce,
	custom,
	literal,
	merge,
	number,
	object,
	optional,
	regex,
	string,
	tuple,
	union,
} from "valibot";

export const argumentsSchema = array(
	union([
		object({
			name: string(),
			kind: literal("string"),
			required: optional(boolean(), false),
			default: optional(string()),
		}),
		object({
			name: string(),
			kind: literal("number"),
			required: optional(boolean(), false),
			default: optional(number()),
		}),
		object({
			name: string(),
			kind: literal("boolean"),
			required: optional(boolean(), false),
			default: optional(boolean()),
		}),
	]),
);

export type Arguments = Output<typeof argumentsSchema>;

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

// Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semVerRegex =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const knownEngines = [
	literal("jscodeshift"),
	literal("repomod-engine"),
	literal("filemod"),
	literal("ts-morph"),
	literal("ast-grep"),
];

const versionValidator = union([
	// react < 18.0.2 (preferred)
	string([regex(semVerRegex)]),
	// react < 18 (for example, when no latest version of a given major is out yet)
	coerce(number(), (input) => Number(input)),
]);

const configJsonBaseSchema = object({
	description: optional(string()),
	version: versionValidator,
	// We should detect the owner when user publishes. This is for backwards compatibility.
	owner: optional(string()),
	// We should have custom logic for this in our code. For orgs, we default to private, for users, we default to public
	// just as npm does.
	private: optional(boolean()),
	// Array of tuples: [libName, versionOperator, version]
	applicability: optional(
		array(
			tuple([
				string(),
				union([
					literal("<"),
					literal(">"),
					literal("="),
					literal("<="),
					literal(">="),
				]),
				versionValidator,
			]),
		),
		[],
	),
	deps: optional(array(string())),
	engine: union([...knownEngines, literal("recipe"), literal("piranha")]),
	arguments: optional(argumentsSchema, []),
	meta: object({
		type: union([
			literal("migration"),
			literal("best practices"),
			literal("cleanup"),
			literal("code mining"),
			literal("other"),
		]),
		changeType: union([literal("assistive"), literal("autonomous")]),
		timeSave: string([
			custom(
				// Returns undefined if input is not valid. We will use the same lib to get the time later in the code.
				(input) => !!ms(input),
				"The timeSave field does not match the expected format. See https://www.npmjs.com/package/ms for format reference.",
			),
		]),
		git: optional(string()),
	}),
});

export const codemodConfigSchema = union([
	merge([
		configJsonBaseSchema,
		object({
			engine: union(knownEngines),
			name: string(),
		}),
	]),
	merge([
		configJsonBaseSchema,
		object({
			engine: literal("recipe"),
			names: array(string()),
		}),
	]),
	merge([
		configJsonBaseSchema,
		object({
			engine: literal("piranha"),
			name: string(),
			language: union(PIRANHA_LANGUAGES.map((language) => literal(language))),
		}),
	]),
]);

export type CodemodConfig = Output<typeof codemodConfigSchema>;
