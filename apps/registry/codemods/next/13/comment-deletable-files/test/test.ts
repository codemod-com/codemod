import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("next 13 comment-deletable-files", function () {
	it("should not add a comment if a file basename does not start with _app / _document / _error", async function () {
		const INPUT = `
			import { useRouter } from 'next/router';

			export function Component() {
				const { query } = useRouter();

				if (query.a && query.b) {

				}
			}
		`;

		const fileInfo: FileInfo = {
			path: "_other.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(actualOutput, undefined);
	});

	it("should add a comment if a file basename starts with _app", async function () {
		const INPUT = `
			import { useRouter } from 'next/router';

			export function Component() {
				const { query } = useRouter();

				if (query.a && query.b) {

				}
			}
		`;
		const OUTPUT = `
            /*This file should be deleted. Please migrate its contents to appropriate files*/
			import { useRouter } from 'next/router';

			export function Component() {
				const { query } = useRouter();

				if (query.a && query.b) {

				}
			}
		`;

		const fileInfo: FileInfo = {
			path: "_app.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			OUTPUT.replace(/\W/gm, ""),
		);
	});
});
