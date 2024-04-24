import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import jscodeshift, { type API } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

const buildApi = (parser: string | undefined): API => ({
	j: parser ? jscodeshift.withParser(parser) : jscodeshift,
	jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
	stats: () => {
		console.error(
			"The stats function was called, which is not supported on purpose",
		);
	},
	report: () => {
		console.error(
			"The report function was called, which is not supported on purpose",
		);
	},
});

describe("react/19/ref-to-arrow-function", () => {
	it("test #1", async () => {
		const INPUT = await readFile(
			join(__dirname, "..", "__testfixtures__/fixture1.input.tsx"),
			"utf-8",
		);
		const OUTPUT = await readFile(
			join(__dirname, "..", "__testfixtures__/fixture1.output.tsx"),
			"utf-8",
		);

		const actualOutput = transform(
			{
				path: "index.js",
				source: INPUT,
			},
			buildApi("tsx"),
		);

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});
});
