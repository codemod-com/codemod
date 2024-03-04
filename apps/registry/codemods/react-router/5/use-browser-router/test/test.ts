import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v5 use-browser-router", () => {
	it("basic", async () => {
		const input = `
		import { Router, browserHistory } from 'react-router';

		const App = () => (
		  <Router history={browserHistory}>
		  </Router>
		);
		`;

		const output = `
		import { BrowserRouter as Router } from 'react-router-dom';

		const App = () => (
		  <Router>
		  </Router>
		);
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
