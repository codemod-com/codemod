import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("remove-unused-feature-flags", () => {
	it("should not change code without feature flags", () => {
		const INPUT = `
        const Component = () => {
			return <div>A</div>;
		}
		`;

		const fileInfo: FileInfo = {
			path: "index.ts",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"), {});

		assert.deepEqual(actualOutput, undefined);
	});

	it("should remove a feature flag check within Promise.all()", () => {
		const INPUT = `
        const [a, b] = await Promise.all([
            Promise.resolve('a'),
            isFlagEnabled('featureFlag'),
        ]);

		const x = b && c;

		const y = <A b={b} />
		`;

		const OUTPUT = `
        const a = await Promise.resolve('a');

		const x = c;

		const y = <A b={true} />
        `;

		const fileInfo: FileInfo = {
			path: "index.ts",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"), {});

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});

	it("should remove a feature flag check within Promise.all() (with options)", () => {
		const INPUT = `
        const [b, a] = await Promise.all([
			fnc('b'),
            Promise.resolve('a'),
        ]);

		const d = () => {
			return c() && b;
		}
		`;

		const OUTPUT = `
        const a = await Promise.resolve('a');

		const d = () => {
			return c();
		}
        `;

		const fileInfo: FileInfo = {
			path: "index.ts",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("ts"), {
			functionName: "fnc",
			featureFlagName: "b",
		});

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});

	it("should replace await isFlagEnabled('featureFlag') with true", () => {
		const INPUT = `const a = await isFlagEnabled('featureFlag');`;

		const OUTPUT = "const a = true;";

		const fileInfo: FileInfo = {
			path: "index.ts",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("ts"), {});

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});
});
