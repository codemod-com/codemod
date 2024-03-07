import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 use-history-hook", () => {
	it("arrow function: should replace browserHistory from react-router-dom with history from useHistory hook", async () => {
		const input = `
		import { browserHistory } from 'react-router-dom';
		const MyApp = () => {
			browserHistory.push('/');
			return null;
		}
		`;

		const output = `
		import { useHistory } from 'react-router-dom';
		const MyApp = () => {
			useHistory().push('/');
			return null;
		}
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

	it("function declaration: should replace browserHistory from react-router-dom with history from useHistory hook", async () => {
		const input = `
		import { browserHistory } from 'react-router-dom';
		function MyApp () {
			useEffect(() => {
				browserHistory.push('/');
			}, []);
			return null;
		}
		`;

		const output = `
		import { useHistory } from 'react-router-dom';
		function MyApp() {
			const browserHistory = useHistory();
			useEffect(() => {
				browserHistory.push('/');
			}, []);
			return null;
		}
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
