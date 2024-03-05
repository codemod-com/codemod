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
	parse,
	regex,
	string,
	tuple,
	union,
} from "valibot";

import glob from "fast-glob";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import {
	access,
	copyFile,
	mkdir,
	readFile,
	readdir,
	rmdir,
	stat,
	unlink,
	writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { deflate } from "node:zlib";
import * as tar from "tar";

const promisifiedDeflate = promisify(deflate);

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

const parseCodemodConfigSchema = (i: unknown) => parse(codemodConfigSchema, i);

const removeDirectoryContents = async (directoryPath: string) => {
	const paths = await readdir(directoryPath);

	for (const path of paths) {
		const absolutePath = join(directoryPath, path);

		const stats = await stat(absolutePath);

		if (!stats.isFile()) {
			await removeDirectoryContents(absolutePath);

			await rmdir(absolutePath);

			continue;
		}

		await unlink(absolutePath);
	}
};

const build = async () => {
	const lastArgument = process.argv.at(-1);

	const buildTarget = lastArgument === "--homedir" ? "homedir" : "build";

	const cwd = join(fileURLToPath(new URL(".", import.meta.url)), "../");

	const codemodsDirectoryPath = join(cwd, "./codemods");

	const configFilePaths = await glob("./**/.codemodrc.json", {
		cwd: codemodsDirectoryPath,
		dot: false,
		ignore: ["**/node_modules/**", "**/build/**"],
	});

	const names = configFilePaths.map(dirname);

	// emitting names

	const buildDirectoryPath =
		buildTarget === "homedir"
			? join(homedir(), ".codemod")
			: join(cwd, "./builder/dist");

	await mkdir(buildDirectoryPath, { recursive: true });

	await removeDirectoryContents(buildDirectoryPath);

	// this is a deprecated feature
	await writeFile(
		join(buildDirectoryPath, "names.json"),
		JSON.stringify(names),
	);

	for (const name of names) {
		const hashDigest = createHash("ripemd160").update(name).digest("base64url");

		const codemodDirectoryPath = join(buildDirectoryPath, hashDigest);

		await mkdir(codemodDirectoryPath, { recursive: true });

		const configPath = join(codemodsDirectoryPath, name, ".codemodrc.json");

		const data = await readFile(configPath, { encoding: "utf8" });

		let config: CodemodConfig;
		try {
			config = parseCodemodConfigSchema(JSON.parse(data));
		} catch (err) {
			continue;
		}

		{
			const configWithName = {
				...config,
				name,
			};

			const buildConfigPath = join(codemodDirectoryPath, ".codemodrc.json");

			writeFile(buildConfigPath, JSON.stringify(configWithName));
		}

		if (
			config.engine === "jscodeshift" ||
			config.engine === "ts-morph" ||
			config.engine === "filemod"
		) {
			try {
				const indexPath = join(
					codemodsDirectoryPath,
					name,
					"dist",
					"index.cjs",
				);

				await access(indexPath, constants.R_OK);

				const data = await readFile(indexPath);

				{
					const buildIndexPath = join(codemodDirectoryPath, "index.cjs");

					writeFile(buildIndexPath, data);
				}

				{
					const compressedBuffer = await promisifiedDeflate(data);

					const buildIndexPath = join(codemodDirectoryPath, "index.cjs.z");

					writeFile(buildIndexPath, compressedBuffer);
				}
			} catch (error) {
				console.error(error);
			}
		} else if (config.engine === "piranha") {
			const rulesPath = join(codemodsDirectoryPath, name, "rules.toml");
			const buildRulesPath = join(codemodDirectoryPath, "rules.toml");

			await copyFile(rulesPath, buildRulesPath);
		} else if (config.engine === "recipe") {
			// nothing to do
		}

		try {
			const readmePath = join(codemodsDirectoryPath, name, "README.md");

			const buildDescriptionPath = join(codemodDirectoryPath, "description.md");

			await access(readmePath, constants.R_OK);

			await copyFile(readmePath, buildDescriptionPath);
		} catch (err) {
			console.error(err);
		}
	}

	if (buildTarget === "build") {
		await tar.create(
			{
				cwd: buildDirectoryPath,
				portable: true,
				file: join(buildDirectoryPath, "registry.tar.gz"),
				gzip: true,
				filter: (path) => {
					return !path.endsWith(".z");
				},
			},
			await readdir(buildDirectoryPath),
		);
	}
};

build();
