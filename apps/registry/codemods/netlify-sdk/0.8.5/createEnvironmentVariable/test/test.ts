import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("netlify 0.8.5 createEnvironmentVariable", () => {
	it("changes createEnvironmentVariable to pass an object instead of the separate arguments", () => {
		const INPUT = `
            createEnvironmentVariable(accountId, siteId, key, values);
        `;

		const OUTPUT = `
            createEnvironmentVariable({
                accountId: accountId,
                siteId: siteId,
                key: key,
                values: values
            })
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
