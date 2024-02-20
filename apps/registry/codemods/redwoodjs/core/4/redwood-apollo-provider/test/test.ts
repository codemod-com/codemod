import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { API, FileInfo } from "jscodeshift";
import jscodeshift from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

describe("@redwoodjs/core v4 redwood-apollo-provider", () => {
	it("should add AuthProvider and useAuth", async () => {
		const input = await readFile(join(__dirname, "input.js"), {
			encoding: "utf8",
		});

		const output = await readFile(join(__dirname, "output.js"), {
			encoding: "utf8",
		});

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const buildApi = (parser: string): API => ({
			j: jscodeshift.withParser(parser),
			jscodeshift: jscodeshift.withParser(parser),
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

		const actualOutput = transform(fileInfo, buildApi("js"), {
			quote: "single",
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			output.replace(/\W/gm, ""),
		);
	});
});
