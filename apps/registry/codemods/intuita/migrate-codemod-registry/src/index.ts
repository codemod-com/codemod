import { format, parse, sep } from "node:path";
import type {
	Filemod,
	HandleData,
	HandleFile,
	HandleFinish,
	InitializeState,
} from "@codemod-com/filemod";
import type jscodeshift from "jscodeshift";

type Dependencies = {
	jscodeshift: typeof jscodeshift;
};
type State = {
	step: "UPSERTING_CODEMODS" | "UPSERTING_WORKSPACES";
	workspaces: Set<string>;
};

const isNeitherNullNorUndefined = <T>(
	t: NonNullable<T> | null | undefined,
): t is NonNullable<T> => t !== null && t !== undefined;

const initializeState: InitializeState<State> = async (_, state) => {
	if (state === null) {
		return {
			step: "UPSERTING_CODEMODS",
			workspaces: new Set(),
		};
	}

	return {
		step: "UPSERTING_WORKSPACES",
		workspaces: state.workspaces,
	};
};

type FileCommand = Awaited<ReturnType<HandleFile<Dependencies, State>>>[number];

const handleFile: HandleFile<Dependencies, State> = async (
	api,
	path,
	options,
	state,
) => {
	const parsedCwd = parse(
		api.joinPaths(api.currentWorkingDirectory, "placeholder.txt"),
	);
	const parsedPath = parse(path);

	const cwdDirectoryNames = parsedCwd.dir.split(sep);
	const pathDirectoryNames = parsedPath.dir.split(sep);

	if (
		["cjs-builder", "builder", "utilities", "tsconfig"].some((name) =>
			pathDirectoryNames.includes(name),
		)
	) {
		return [];
	}

	if (![".ts", ".js", ".json", ".md", ".toml"].includes(parsedPath.ext)) {
		return [];
	}

	const directoryName = pathDirectoryNames
		.map((name, i) => (name !== cwdDirectoryNames[i] ? name : null))
		.filter(isNeitherNullNorUndefined);

	if (directoryName.length === 0) {
		if (parsedPath.base === "package.json") {
			return [
				{
					kind: "upsertFile",
					path: api.joinPaths(
						api.currentWorkingDirectory,
						"pnpm-workspace.yaml",
					),
					options,
				},
			];
		}

		return [];
	}

	const newPath = api.joinPaths(
		api.currentWorkingDirectory,
		"codemods",
		...directoryName,
		parsedPath.name === "index"
			? "src"
			: parsedPath.name === "test" && directoryName.at(-1) !== "test"
			  ? "test"
			  : "",
		parsedPath.base,
	);

	const data = await api.readFile(path);

	const commands: FileCommand[] = [
		{
			kind: "upsertFile",
			path: newPath,
			options: {
				...options,
				data,
			},
		},
	];

	if (parsedPath.base === ".codemodrc.json") {
		const parsedData = JSON.parse(data);

		const { engine } = parsedData;

		state?.workspaces.add(
			api.joinPaths("codemods", ...directoryName.slice(0, -1), "*"),
		);

		const indexTsPath = format({
			root: parsedPath.root,
			dir: parsedPath.dir,
			base: "index.ts",
		});

		const testTsPath = format({
			root: parsedPath.root,
			dir: parsedPath.dir,
			base: "test.ts",
		});

		const embeddedTestTsPath = format({
			root: parsedPath.root,
			dir: `${parsedPath.dir}/test`,
			base: "test.ts",
		});

		const indexTsDoesExist = api.exists(indexTsPath);

		const testTsDoesExist =
			api.exists(testTsPath) || api.exists(embeddedTestTsPath);

		{
			const packageJsonPath = api.joinPaths(
				api.currentWorkingDirectory,
				"codemods",
				...directoryName,
				"package.json",
			);

			const name = `@codemod-com/registry/${directoryName
				.join("-")
				.toLowerCase()
				.replace(/ /, "-")}`;

			commands.push({
				kind: "upsertFile",
				path: packageJsonPath,
				options: {
					...options,
					name,
					engine,
					extension: indexTsDoesExist ? "ts" : "js",
					testTsDoesExist,
				},
			});
		}

		const jsEngineUsed = engine !== "recipe" && engine !== "piranha";

		if (jsEngineUsed) {
			const tsconfigJsonPath = api.joinPaths(
				api.currentWorkingDirectory,
				"codemods",
				...directoryName,
				"tsconfig.json",
			);

			commands.push({
				kind: "upsertFile",
				path: tsconfigJsonPath,
				options,
			});
		}

		if (jsEngineUsed) {
			const mocharcPath = api.joinPaths(
				api.currentWorkingDirectory,
				"codemods",
				...directoryName,
				".mocharc.json",
			);

			commands.push({
				kind: "upsertFile",
				path: mocharcPath,
				options: {
					...options,
				},
			});
		}

		if (jsEngineUsed) {
			const indexDtsPath = api.joinPaths(
				api.currentWorkingDirectory,
				"codemods",
				...directoryName,
				"index.d.ts",
			);

			commands.push({
				kind: "upsertFile",
				path: indexDtsPath,
				options: {
					...options,
					engine,
				},
			});
		}
	}

	return commands;
};

const handleData: HandleData<Dependencies, State> = async (
	api,
	path,
	__,
	options,
	state,
) => {
	if (state === null) {
		throw new Error("The state is not set");
	}

	if (state.step === "UPSERTING_CODEMODS") {
		if (path.endsWith("package.json")) {
			const name = typeof options.name === "string" ? options.name : null;

			const engine = typeof options.engine === "string" ? options.engine : null;

			const extension =
				typeof options.extension === "string" ? options.extension : null;

			const testTsDoesExist =
				typeof options.testTsDoesExist === "boolean"
					? options.testTsDoesExist
					: false;

			if (name === null || engine === null || extension === null) {
				throw new Error("Name and engine need to be defined for package.json");
			}

			const jsEngineUsed = engine !== "recipe" && engine !== "piranha";

			const dependencies: Record<string, string> | undefined = jsEngineUsed
				? {}
				: undefined;

			const devDependencies: Record<string, string> | undefined = jsEngineUsed
				? {
						"@codemod-com/tsconfig": "workspace:*",
						"@codemod-com/utilities": "workspace:*",
						"@codemod-com/registry-cjs-builder": "workspace:*",
						typescript: "^5.2.2",
						esbuild: "0.19.5",
						mocha: "^10.2.0",
						"@types/mocha": "^10.0.4",
						"ts-node": "^10.9.1",
				  }
				: undefined;

			if (devDependencies !== undefined && engine === "jscodeshift") {
				devDependencies.jscodeshift = "^0.15.1";
				devDependencies["@types/jscodeshift"] = "^0.11.10";
			} else if (devDependencies !== undefined && engine === "ts-morph") {
				devDependencies["ts-morph"] = "^19.0.0";
			} else if (devDependencies !== undefined && engine === "filemod") {
				devDependencies["@codemod-com/filemod"] = "1.1.0";
				// this might be required sometimes
				devDependencies.memfs = "^4.6.0";
				devDependencies["ts-morph"] = "^19.0.0";
				devDependencies.jscodeshift = !path.includes("remove-get-static-props")
					? "^0.15.1"
					: "0.14.0";
				devDependencies["@types/jscodeshift"] = "^0.11.10";
			}

			if (dependencies && path.includes("ember/5/no-implicit-this")) {
				dependencies["ember-codemods-telemetry-helpers"] = "^3.0.0";
				dependencies["ember-template-recast"] = "^6.1.4";
				dependencies.debug = "^4.3.4";
			}

			if (dependencies && path.includes("next/13/move-css-in-js-styles")) {
				dependencies.sinon = "^15.0.1";
			}

			if (
				dependencies &&
				(path.includes("app-directory-boilerplate") ||
					path.includes("replace-next-head"))
			) {
				dependencies["mdast-util-from-markdown"] = "^2.0.0";
				dependencies["mdast-util-to-markdown"] = "^2.1.0";
				dependencies["micromark-extension-mdxjs"] = "^2.0.0";
				dependencies["mdast-util-mdx"] = "^3.0.0";
				dependencies["unist-util-visit"] = "^5.0.0";
			}

			if (dependencies && path.includes("replace-next-head")) {
				dependencies["unist-util-filter"] = "^5.0.1";
			}

			const main = jsEngineUsed ? "./dist/index.cjs" : undefined;
			const types = jsEngineUsed ? "/dist/index.d.ts" : undefined;

			const scripts: Record<string, string> | undefined = jsEngineUsed
				? {
						"build:cjs": `cjs-builder ./src/index.${extension}`,
				  }
				: undefined;

			if (scripts !== undefined && testTsDoesExist) {
				scripts.test = "mocha";
			}

			const files: string[] = ["DESCRIPTION.md", ".codemodrc.json"];

			if (jsEngineUsed) {
				files.push("./dist/index.cjs", "./index.d.ts");
			}

			const data = JSON.stringify({
				name,
				dependencies,
				devDependencies,
				main,
				types,
				scripts,
				files,
				type: "module",
			});

			return {
				kind: "upsertData",
				path,
				data,
			};
		}

		if (path.endsWith("index.d.ts")) {
			const engine = typeof options.engine === "string" ? options.engine : null;

			if (engine === null) {
				throw new Error("Name and engine need to be defined for package.json");
			}

			const data =
				engine === "jscodeshift"
					? [
							"import type { API, FileInfo } from 'jscodeshift';",
							"export default function transform(file: FileInfo, api: API): string;",
					  ].join("\n")
					: engine === "ts-morph"
					  ? [
								"import type { SourceFile } from 'ts-morph';",
								"export function handleSourceFile(sourceFile: SourceFile): string | undefined;",
						  ].join("\n")
					  : engine === "filemod"
						  ? [
									"import type { Filemod } from '@codemod-com/filemod';",
									"export const repomod: Filemod<{}, {}>;",
							  ].join("\n")
						  : "";

			return {
				kind: "upsertData",
				path,
				data,
			};
		}

		if (path.endsWith(".mocharc.json")) {
			const data = JSON.stringify({
				loader: ["ts-node/esm"],
				"full-trace": true,
				failZero: false,
				bail: true,
				spec: "./**/test.ts",
				timeout: 5000,
			});

			return {
				kind: "upsertData",
				path,
				data,
			};
		}

		if (path.endsWith("tsconfig.json")) {
			const data = JSON.stringify({
				extends: "@codemod-com/tsconfig",
				include: [
					"./src/**/*.ts",
					"./src/**/*.js",
					"./test/**/*.ts",
					"./test/**/*.js",
				],
			});

			return {
				kind: "upsertData",
				path,
				data,
			};
		}

		if (path.endsWith("test.ts")) {
			const data = typeof options.data === "string" ? options.data : null;

			if (data === null) {
				throw new Error("Data must be present for test.ts files");
			}

			const { jscodeshift: j } = api.getDependencies();

			const root = j.withParser("tsx")(data);

			// adapted from codemod.studio AI
			let dirtyFlag = false;

			root.find(j.ImportDeclaration).forEach((path) => {
				if (path.node.type === "ImportDeclaration") {
					if (path.node.source.value === "./index.js") {
						path.node.source.value = "../src/index.js";
						dirtyFlag = true;
					}

					if (path.node.source.value === "../index.js") {
						path.node.source.value = "../src/index.js";
						dirtyFlag = true;
					}

					if (path.node.source.value?.toString().endsWith("../utilities.js")) {
						path.node.source.value = "@codemod-com/utilities";
						dirtyFlag = true;
					}
				}
			});

			return {
				kind: "upsertData",
				path,
				data: dirtyFlag ? root.toSource() : data,
			};
		}

		if (typeof options.data === "string") {
			return {
				kind: "upsertData",
				path,
				data: options.data,
			};
		}

		return { kind: "noop" };
	}

	if (
		state.step === "UPSERTING_WORKSPACES" &&
		path.endsWith("pnpm-workspace.yaml")
	) {
		const workspaces = Array.from(state.workspaces).sort();
		workspaces.unshift("builder");
		workspaces.unshift("utilities");
		workspaces.unshift("tsconfig");
		workspaces.unshift("cjs-builder");

		const data = [
			"packages:",
			...workspaces.map((workspace) => `  - './${workspace}'`),
			"",
		].join("\n");

		return {
			kind: "upsertData",
			path,
			data,
		};
	}

	return { kind: "noop" };
};

const handleFinish: HandleFinish<State> = async (_, state) => {
	if (state === null) {
		throw new Error("The state is not set");
	}

	return {
		kind: state.step === "UPSERTING_CODEMODS" ? "restart" : "noop",
	};
};

export const repomod: Filemod<Dependencies, State> = {
	includePatterns: ["**/**/*.{js,ts,json,md,toml}"],
	excludePatterns: ["**/node_modules/**", "**/build/**", "**/codemods/**"],
	initializeState,
	handleFile,
	handleData,
	handleFinish,
};
