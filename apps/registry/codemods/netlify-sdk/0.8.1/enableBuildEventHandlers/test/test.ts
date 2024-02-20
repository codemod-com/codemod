import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("netlify 0.8.1 disableBuildEventHandlers", function () {
	it("changes disableBuildhook to disableBuildEventHandlers", function () {
		const INPUT = `
			await client.enableBuildhook(siteId);
        `;

		const OUTPUT = `
			await client.enableBuildEventHandlers(siteId);
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			OUTPUT.replace(/\W/gm, ""),
		);
	});
});
