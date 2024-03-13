import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("history v4 use-back", () => {
	it("should replace history.push(path, { state }) with history.push(path, state)", async () => {
		const input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push('/new-path', { state: { key: 'value' } });
		`;

		const output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push('/new-path', { key: 'value' });
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(actualOutput, output);
	});
});
