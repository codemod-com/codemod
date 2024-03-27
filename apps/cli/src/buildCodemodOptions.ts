import { readFile } from "node:fs/promises";
import path from "node:path";
import {
	CodemodConfig,
	KnownEngines,
	knownEnginesSchema,
	parseCodemodConfig,
} from "@codemod-com/utilities";
import { glob } from "fast-glob";
import { IFs } from "memfs";
import { object, parse } from "valibot";
import { Codemod } from "./codemod.js";
import { CodemodSettings } from "./schemata/codemodSettingsSchema.js";

const extractEngine = async (
	fs: IFs,
	filePath: string,
): Promise<KnownEngines | null> => {
	try {
		const data = await fs.promises.readFile(filePath, {
			encoding: "utf-8",
		});

		const schema = object({
			engine: knownEnginesSchema,
		});

		const { engine } = parse(schema, JSON.parse(data.toString()));

		return engine;
	} catch {
		return null;
	}
};

const extractMainScriptPath = async (
	codemodRc: CodemodConfig,
	source: string,
) => {
	let globSearchPattern: string;
	let actualMainFileName: string;
	let errorOnMissing: string;

	switch (codemodRc.engine) {
		case "ast-grep":
			globSearchPattern = "**/rule.yaml";
			actualMainFileName = "rule.yaml";
			errorOnMissing = `Please create the main "rule.yaml" file first.`;
			break;
		case "piranha":
			globSearchPattern = "**/rules.toml";
			actualMainFileName = "rules.toml";
			errorOnMissing = `Please create the main "rules.toml" file first.`;
			break;
		default:
			globSearchPattern = "dist/index.cjs";
			actualMainFileName = "index.cjs";
			errorOnMissing = `Did you forget to run "codemod build"?`;
	}

	const mainFiles = await glob(codemodRc.build?.output ?? globSearchPattern, {
		absolute: true,
		cwd: source,
		onlyFiles: true,
	});

	if (mainFiles.length === 0) {
		throw new Error(
			`Could not find the main file of the codemod with name ${actualMainFileName}. ${errorOnMissing}`,
		);
	}

	return mainFiles.at(0)!;
};

export const buildSourcedCodemodOptions = async (
	fs: IFs,
	codemodOptions: CodemodSettings & { kind: "runSourced" },
): Promise<Codemod & { source: "fileSystem" }> => {
	const isDirectorySource = await fs.promises
		.lstat(codemodOptions.source)
		.then((pathStat) => pathStat.isDirectory());

	if (!isDirectorySource) {
		if (codemodOptions.codemodEngine === null) {
			throw new Error("--engine has to be defined when running local codemod");
		}

		return {
			source: "fileSystem" as const,
			engine: codemodOptions.codemodEngine,
			indexPath: codemodOptions.source,
		};
	}

	let codemodRcContent: string;
	try {
		codemodRcContent = await readFile(
			path.join(codemodOptions.source, ".codemodrc.json"),
			{ encoding: "utf-8" },
		);
	} catch (err) {
		throw new Error(
			`Codemod directory is of incorrect structure at ${codemodOptions.source}`,
		);
	}

	const codemodConfig = parseCodemodConfig(JSON.parse(codemodRcContent));

	const mainScriptPath = await extractMainScriptPath(
		codemodConfig,
		codemodOptions.source,
	);

	const engine = await extractEngine(
		fs,
		path.join(codemodOptions.source, ".codemodrc.json"),
	);

	if (engine === null) {
		throw new Error(
			`Engine specified in .codemodrc.json at ${codemodOptions.source} is not a JavaScript codemod engine or does not exist.`,
		);
	}

	return {
		source: "fileSystem" as const,
		engine,
		indexPath: mainScriptPath,
	};
};
