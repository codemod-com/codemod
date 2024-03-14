import assert from "node:assert/strict";
import { buildApi, trimLicense } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("history v4 use-location", () => {
	it("should replace history.getCurrentLocation() with history.location", async () => {
		const input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		const currentLocation = history.getCurrentLocation();
		`;

		const output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		const currentLocation = history.location;
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: trimLicense(input),
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			trimLicense(output).replace(/\W/gm, ""),
		);
	});
});
