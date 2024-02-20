import assert from "node:assert/strict";
import { buildApi, trimLicense } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 create-hash-history", function () {
	it("should add createHashHistory", async function () {
		const input = `
		import { Router, hashHistory } from 'react-router';

		const MyApp = () => (
		<Router history={hashHistory}>
			<Route path="/posts" component={PostList} />
		</Router>
		);
		`;

		const output = `
		const history = createHashHistory();
		import createHashHistory from 'history/createHashHistory';
		import { Router, hashHistory } from 'react-router';

		const MyApp = () => (
		<Router history={history}>
			<Route path="/posts" component={PostList} />
		</Router>
		);
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: trimLicense(input),
		};

		const actualOutput = transform(fileInfo, buildApi("js"), {
			quote: "single",
		});

		console.log(output, actualOutput, "??");

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			trimLicense(output).replace(/\W/gm, ""),
		);
	});
});
