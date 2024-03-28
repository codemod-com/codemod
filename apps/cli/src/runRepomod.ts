import { createHash } from "node:crypto";
import { basename, dirname, join } from "node:path";
import {
	CallbackService,
	Filemod,
	GlobArguments,
	PathAPI,
	PathHashDigest,
	UnifiedEntry,
	UnifiedFileSystem,
	buildApi,
	executeFilemod,
} from "@codemod-com/filemod";
import hastToBabelAst from "@svgr/hast-util-to-babel-ast";
import { FileSystemAdapter, glob } from "fast-glob";
import jscodeshift from "jscodeshift";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";
import { IFs } from "memfs";
import { mdxjs } from "micromark-extension-mdxjs";
import rehypeParse from "rehype-parse";
import tsmorph from "ts-morph";
import { unified } from "unified";
import { filter } from "unist-util-filter";
import { visit } from "unist-util-visit";
import { FileCommand } from "./fileCommands.js";
import { OperationMessage } from "./messages.js";
import { SafeArgumentRecord } from "./safeArgumentRecord.js";

const parseMdx = (data: string) =>
	fromMarkdown(data, {
		extensions: [mdxjs()],
		mdastExtensions: [mdxFromMarkdown()],
	});

const stringifyMdx = (tree: Root) =>
	toMarkdown(tree, { extensions: [mdxToMarkdown()] });

type Root = ReturnType<typeof fromMarkdown>;

export type Dependencies = Readonly<{
	jscodeshift: typeof jscodeshift;
	unified: typeof unified;
	rehypeParse: typeof rehypeParse;
	hastToBabelAst: typeof hastToBabelAst;
	tsmorph: typeof tsmorph;
	parseMdx: typeof parseMdx;
	stringifyMdx: typeof stringifyMdx;
	filterMdxAst: typeof filter;
	visitMdxAst: typeof visit;
	unifiedFileSystem: UnifiedFileSystem;
	fetch: typeof fetch;
}>;

export const runRepomod = async (
	fileSystem: IFs,
	filemod: Filemod<Dependencies, Record<string, unknown>>,
	target: string,
	disablePrettier: boolean,
	safeArgumentRecord: SafeArgumentRecord,
	onPrinterMessage: (message: OperationMessage) => void,
	currentWorkingDirectory: string,
): Promise<readonly FileCommand[]> => {
	const buildPathHashDigest = (path: string) =>
		createHash("ripemd160").update(path).digest("base64url") as PathHashDigest;

	const getUnifiedEntry = async (path: string): Promise<UnifiedEntry> => {
		const stat = await fileSystem.promises.stat(path);

		if (stat.isDirectory()) {
			return {
				kind: "directory",
				path,
			};
		}

		if (stat.isFile()) {
			return {
				kind: "file",
				path,
			};
		}

		throw new Error(`The entry ${path} is neither a directory nor a file`);
	};

	const globWrapper = (globArguments: GlobArguments) => {
		return glob(globArguments.includePatterns.slice(), {
			absolute: true,
			cwd: globArguments.currentWorkingDirectory,
			ignore: globArguments.excludePatterns.slice(),
			fs: fileSystem as Partial<FileSystemAdapter>,
			dot: true,
		});
	};

	const readDirectory = async (
		path: string,
	): Promise<ReadonlyArray<UnifiedEntry>> => {
		const entries = await fileSystem.promises.readdir(path, {
			withFileTypes: true,
		});

		return entries.map((entry) => {
			if (typeof entry === "string" || !("isDirectory" in entry)) {
				throw new Error("Entry can neither be a string or a Buffer");
			}

			if (entry.isDirectory()) {
				return {
					kind: "directory" as const,
					path: join(path, entry.name.toString()),
				};
			}

			if (entry.isFile()) {
				return {
					kind: "file" as const,
					path: join(path, entry.name.toString()),
				};
			}

			throw new Error("The entry is neither directory not file");
		});
	};

	const readFile = async (path: string): Promise<string> => {
		const data = await fileSystem.promises.readFile(path, {
			encoding: "utf8",
		});

		return data.toString();
	};

	const unifiedFileSystem = new UnifiedFileSystem(
		buildPathHashDigest,
		getUnifiedEntry,
		globWrapper,
		readDirectory,
		readFile,
	);

	const pathAPI: PathAPI = {
		getDirname: (path) => dirname(path),
		getBasename: (path) => basename(path),
		joinPaths: (...paths) => join(...paths),
		currentWorkingDirectory,
	};

	const api = buildApi<Dependencies>(
		unifiedFileSystem,
		() => ({
			jscodeshift,
			unified,
			rehypeParse,
			hastToBabelAst,
			tsmorph,
			parseMdx,
			stringifyMdx,
			fetch,
			visitMdxAst: visit,
			filterMdxAst: filter,
			unifiedFileSystem,
		}),
		pathAPI,
	);

	const processedPathHashDigests = new Set<string>();

	const totalPathHashDigests = new Set<string>();

	for (const path of filemod.includePatterns ?? []) {
		totalPathHashDigests.add(
			createHash("ripemd160").update(path).digest("base64url"),
		);
	}

	const callbackService: CallbackService = {
		onCommandExecuted: (command) => {
			if (command.kind !== "upsertData" && command.kind !== "deleteFile") {
				return;
			}

			const hashDigest = createHash("ripemd160")
				.update(command.path)
				.digest("base64url");

			processedPathHashDigests.add(hashDigest);
			totalPathHashDigests.add(hashDigest);

			onPrinterMessage({
				kind: "progress",
				processedFileNumber: processedPathHashDigests.size,
				totalFileNumber: totalPathHashDigests.size,
				processedFileName: command.path,
			});
		},
		onError: (path, message) => {
			onPrinterMessage({
				kind: "error",
				path,
				message,
			});
		},
	};

	const externalFileCommands = await executeFilemod(
		api,
		filemod,
		target,
		safeArgumentRecord,
		callbackService,
	);

	return Promise.all(
		externalFileCommands.map(async (externalFileCommand) => {
			if (externalFileCommand.kind === "upsertFile") {
				try {
					await fileSystem.promises.stat(externalFileCommand.path);

					return {
						kind: "updateFile",
						oldPath: externalFileCommand.path,
						oldData: "", // TODO get the old data from the filemod
						newData: externalFileCommand.data,
						formatWithPrettier: !disablePrettier, // TODO have a list of extensions that prettier supports
					};
				} catch (error) {
					return {
						kind: "createFile",
						newPath: externalFileCommand.path,
						newData: externalFileCommand.data,
						formatWithPrettier: !disablePrettier,
					};
				}
			}

			return {
				kind: "deleteFile",
				oldPath: externalFileCommand.path,
			};
		}),
	);
};
