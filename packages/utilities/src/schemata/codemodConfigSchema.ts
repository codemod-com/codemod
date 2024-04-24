import {
	type Input,
	type Issues,
	type Output,
	ValiError,
	array,
	boolean,
	custom,
	literal,
	merge,
	number,
	object,
	optional,
	parse,
	regex,
	string,
	tuple,
	union,
} from "valibot";
import { isNeitherNullNorUndefined } from "../functions/validationMethods.js";

const getFirstValibotIssue = (issues: Issues) => {
	let reasonableError: string | undefined;

	for (const issue of issues) {
		if (issue.issues) {
			reasonableError = getFirstValibotIssue(issue.issues);
		}

		const firstIssueWithPath = issues.find((issue) =>
			isNeitherNullNorUndefined(issue.path),
		);

		if (isNeitherNullNorUndefined(firstIssueWithPath)) {
			reasonableError = `${
				firstIssueWithPath.message
			} at \`${firstIssueWithPath.path?.map((p) => p.key).join(".")}\``;
			break;
		}
	}

	if (!reasonableError) {
		reasonableError = issues.at(0)?.message;
	}

	return reasonableError;
};

export const extractLibNameAndVersion = (val: string) => {
	const parts = val.split("@");
	let version: string | null = null;
	let libName: string;
	if (parts.length > 1) {
		version = parts.pop() ?? null;
		libName = parts.join("@");
	} else {
		libName = val;
	}

	return { libName, version };
};

export const codemodNameRegex = /[a-zA-Z0-9_/@-]+/;

export const argumentsSchema = array(
	union(
		[
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
		],
		"Invalid arguments definition.",
	),
);

export type Arguments = Output<typeof argumentsSchema>;
export type ArgumentsInput = Input<typeof argumentsSchema>;

export const PIRANHA_LANGUAGES = [
	"java",
	"kt",
	"go",
	"py",
	"swift",
	"ts",
	"tsx",
	"scala",
] as const;

export const piranhaLanguageSchema = union(
	PIRANHA_LANGUAGES.map((language) => literal(language)),
);

export type PiranhaLanguage = Output<typeof piranhaLanguageSchema>;

// Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semVerRegex =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const versionUnion = union(
	[literal("<"), literal(">"), literal("="), literal("<="), literal(">=")],
	"Invalid version range operator.",
);

const getLibraryVersionTupleValidator = (msg: string) =>
	tuple(
		[
			string("Library name has to be a string."),
			versionUnion,
			union([
				// react < 18.0.2 (preferred)
				string([regex(semVerRegex, "Invalid semver.")]),
				// react < 18 (for example, when no latest version of a given major is out yet)
				string([regex(/^\d+$/)]),
			]),
		],
		msg,
	);

const knownEngines = [
	literal("jscodeshift"),
	literal("filemod"),
	literal("ts-morph"),
	literal("ast-grep"),
];
export const knownEnginesSchema = union(
	knownEngines,
	"Specified engine is not supported.",
);
export type KnownEngines = Output<typeof knownEnginesSchema>;

const allEngines = [...knownEngines, literal("recipe"), literal("piranha")];
export const allEnginesSchema = union(
	allEngines,
	"Specified engine is not supported.",
);
export type AllEngines = Output<typeof allEnginesSchema>;

const configJsonBaseSchema = object({
	name: string(`"name" of the codemod has to be a string.`),
	description: optional(string(`"description" has to be a string.`)),
	version: string([regex(semVerRegex, `"version" has to be a valid semver.`)]),
	engine: allEnginesSchema,
	// We should have custom logic for this in our code. For orgs, we default to private, for users, we default to public
	// just as npm does.
	private: optional(boolean(`"private" field has to be a boolean.`)),
	// To overwrite default include patterns
	include: optional(
		array(
			string("Include has to be an array of strings."),
			"Include has to be an array of strings.",
		),
	),
	applicability: optional(
		object({
			// Array of tuples: [libName, versionOperator, version]
			from: optional(
				array(
					getLibraryVersionTupleValidator(
						`Invalid library version specified in "from" field. It has to be of the following format: [["libname", ">=", "1.0.0"]].`,
					),
					`"from" has to be an array of tuples of the following format: [["libname", ">=", "1.0.0"]].`,
				),
			),
			// Array of tuples: [libName, versionOperator, version]
			to: optional(
				array(
					getLibraryVersionTupleValidator(
						`Invalid library version specified in "to" field. It has to be of the following format: [["libname", ">=", "1.0.0"]].`,
					),
					`"to" has to be an array of tuples of the following format: [["libname", ">=", "1.0.0"]].`,
				),
			),
		}),
	),
	deps: optional(
		array(
			string([
				custom((val) => {
					const { libName, version } = extractLibNameAndVersion(val);
					// e.g. -jest
					if (libName?.startsWith("-")) {
						return true;
					}

					// e.g. vitest. This would install the latest version
					if (version === null) {
						return true;
					}

					// e.g. vitest@2.0.0
					return semVerRegex.test(version);
				}, `"deps" has to be an array of valid strings. E.g. libraryToAdd@2.0.0, libraryToAdd or -libraryToRemove`),
			]),
			`"deps" has to be an array of strings.`,
		),
	),
	arguments: optional(argumentsSchema, []),
	meta: optional(
		object({
			tags: optional(
				array(
					string("Tags has to be an array of strings."),
					`"tags" has to be an array of strings.`,
				),
				[],
			),
			git: optional(string("Git link has to be a string.")),
		}),
	),
	build: optional(
		object(
			{
				input: optional(string("Build input path has to be a string.")),
				output: optional(string("Build output path has to be a string.")),
			},
			`Invalid build definition. "build" has to be an object.`,
		),
	),
});

export const codemodConfigSchema = union([
	merge([
		configJsonBaseSchema,
		object({
			engine: knownEnginesSchema,
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
			language: piranhaLanguageSchema,
		}),
	]),
]);

export const parseCodemodConfig = (config: unknown) => {
	try {
		return parse(codemodConfigSchema, config, { abortEarly: true });
	} catch (err) {
		if (!(err instanceof ValiError)) {
			throw new Error("Error parsing config file");
		}

		throw new Error(
			`Error parsing config file: ${getFirstValibotIssue(err.issues)}`,
		);
	}
};

export type CodemodConfig = Output<typeof codemodConfigSchema>;
export type CodemodConfigInput = Input<typeof codemodConfigSchema>;
