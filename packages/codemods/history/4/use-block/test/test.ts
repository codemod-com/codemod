import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("history v4 use-block", () => {
	it("should replace history.listenBefore() with history.block() when location is used", async () => {
		const input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.listenBefore(location => {
			console.log(location);
		});
		`;

		const output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.block(({ location }) => {
			console.log(location);
		});
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/[\s_;()]/gm, ""),
			output.replace(/[\s_;()]/gm, ""),
		);
	});

	it("should replace history.listenBefore() with history.block() when both location and action are used", async () => {
		const input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.listenBefore((location, callback) => {
			console.log(location);
			callback();
		});
		`;

		const output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.block(({ location, action }) => {
			console.log(location);
			action();
		});
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/[\s_;()]/gm, ""),
			output.replace(/[\s_;()]/gm, ""),
		);
	});
});
