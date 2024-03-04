import path, { dirname } from "path";
import { readFile, readdir } from "fs/promises";
import ms from "ms";
import {
	array,
	boolean,
	coerce,
	custom,
	excludes,
	flatten,
	literal,
	merge,
	number,
	object,
	omit,
	optional,
	parse,
	regex,
	safeParse,
	string,
	tuple,
	union,
} from "valibot";

// Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semVerRegex =
	/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const knownEngines = [
	literal("jscodeshift"),
	literal("repomod-engine"),
	literal("filemod"),
	literal("ts-morph"),
	literal("piranha"),
];

// const javaScriptCodemodEngineSchema = union([
// 	literal("jscodeshift"),
// 	literal("repomod-engine"),
// 	literal("filemod"),
// 	literal("ts-morph"),
// ]);
// const engineSchemaWithRecipe = union([
// 	literal("jscodeshift"),
// 	literal("repomod-engine"),
// 	literal("filemod"),
// 	literal("ts-morph"),
// 	literal("recipe"),
// ]);

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
	engine: union([...knownEngines, literal("recipe")]),
	// engine: codemodEngineSchema,
	arguments: optional(
		array(
			object({
				name: string(),
				description: optional(string()),
				kind: union([
					literal("string"),
					literal("number"),
					literal("boolean"),
					literal("array"),
					literal("object"),
				]),
				required: optional(boolean(), false),
			}),
		),
	),
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

const configJsonSchema = union([
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
]);

// const example = {
// 	version: "1.0.0",
// 	private: false,
// 	name: "next/13/remove-get-static-props",
// 	description: "The codemod removes getStaticProps data fetching method.",
// 	engine: "jscodeshift",
// 	extensions: ["js*", "ts*"],
// 	applicability: [["next", "<", "13.0.0"]],
// 	arguments: [
// 		{
// 			name: "buildLegacyCtxUtilAbsolutePath",
// 			description: "Absolute path of buildLegacyCtx utility file",
// 			kind: "string",
// 			required: true,
// 		},
// 	],
// 	owner: "codemod.com",
// 	meta: {
// 		type: "migration",
// 		changeType: "autonomous",
// 		timeSave: "5m",
// 	},
// };

(async () => {
	const codemodsPath = path.join(
		dirname(import.meta.url.replace("file:", "")),
		"../..",
		"registry",
		"codemods",
	);

	async function findConfigFiles(dir: string) {
		let files: string[] = [];

		try {
			const items = await readdir(dir, { withFileTypes: true });
			for (const item of items) {
				if (item.isDirectory()) {
					// If the item is a directory, recurse into it
					files = files.concat(
						await findConfigFiles(path.join(dir, item.name)),
					);
				} else if (item.name === "config.json") {
					// If the item is a file named config.json, add it to the list
					files.push(path.join(dir, item.name));
				}
			}
		} catch (err) {
			console.error("Error reading directory:", err);
		}

		return files;
	}

	const paths = await findConfigFiles(codemodsPath);
	for (const configPath of paths) {
		try {
			const file = await readFile(configPath, { encoding: "utf-8" });
			const config = JSON.parse(file);
			const parsedConfig = parse(configJsonSchema, config);
		} catch (err) {
			console.log(configPath);
			for (const issue of err.issues) {
				console.log(flatten(issue));
			}
		}
	}
})();

// {
//   "version": "regex for semantic version",
//   "private": optional(boolean()), - false by default for orgs, true for users, can be overriden,
//   "name": string(),
//   "applicability": array(tuple([string(), < > = <= >=, "semantic version"])),
//   "deps": array(string()),
//   "engine": union(known_engines),
//   "arguments": optional(array(?)) - check examples with arguments and validate,
//   "meta": {
//     "type": "migration|best practices|cleanup|code mining|other|lazy-other" (suggested by Alex),
//     "changeType": union("assistive", "autonomous"),
//     "timeSave": "use convention from this lib https://www.npmjs.com/package/ms",
//     "git": "url github regex"
//   }
// }
