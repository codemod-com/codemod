import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("history v4 use-back", () => {
	it("should extract `state` object into the second argument", async () => {
		const input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push({ pathname: '/new-path', search: 'search', hash: 'hash', state: { key: 'value' } });
		`;

		const output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push({ pathname: '/new-path', search: 'search', hash: 'hash' }, { key: 'value' });
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			output.replace(/\W/gm, ""),
		);
	});

	it("should do nothing if the argument is simply a string.", async () => {
		const input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push('/new-path');
		`;

		const output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push('/new-path');
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			output.replace(/\W/gm, ""),
		);
	});
});
