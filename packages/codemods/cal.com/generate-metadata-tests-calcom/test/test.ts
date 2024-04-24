import { deepStrictEqual } from "node:assert";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import { buildData, repomod } from "../src/index.js";

const transform = async (json: DirectoryJSON) => {
	const volume = Volume.fromJSON(json);
	const fs = createFsFromVolume(volume);

	const unifiedFileSystem = buildUnifiedFileSystem(fs);
	const pathApi = buildPathAPI("/");

	const api = buildApi<Record<string, never>>(
		unifiedFileSystem,
		() => ({}),
		pathApi,
	);

	return executeFilemod(api, repomod, "/", { testPath: "/opt/tests" }, {});
};

type ExternalFileCommand = Awaited<ReturnType<typeof transform>>[number];

const removeWhitespaces = (
	command: ExternalFileCommand,
): ExternalFileCommand => {
	if (command.kind !== "upsertFile") {
		return command;
	}

	return {
		...command,
		data: command.data.replace(/\s/, ""),
	};
};

describe("generate-metadata-tests", () => {
	it("should build correct files", async () => {
		const [command] = await transform({
			"/opt/project/pages/a/index.tsx": "",
		});

		const data = buildData("a").replace(/\s/, "");

		deepStrictEqual(removeWhitespaces(command!), {
			kind: "upsertFile",
			path: "/opt/tests/a.e2e.ts",
			data,
		});
	});

	it("should build correct files", async () => {
		const [command] = await transform({
			"/opt/project/pages/a/[b].tsx": "",
		});

		const data = buildData("a/[b]").replace(/\s/, "");

		deepStrictEqual(removeWhitespaces(command!), {
			kind: "upsertFile",
			path: "/opt/tests/a/[b].e2e.ts",
			data,
		});
	});

	it("should build correct files", async () => {
		const [command] = await transform({
			"/opt/project/pages/a/[b]/c.tsx": "",
		});

		const data = buildData("a/[b]/c").replace(/\s/, "");

		deepStrictEqual(removeWhitespaces(command!), {
			kind: "upsertFile",
			path: "/opt/tests/a/[b]/c.e2e.ts",
			data,
		});
	});
});
