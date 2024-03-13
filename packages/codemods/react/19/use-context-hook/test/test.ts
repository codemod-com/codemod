import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("useContext -> use", () => {
	it("should replace useContext with use", async () => {
		const input = `
    import { useContext } from "react";
    import ThemeContext from "./ThemeContext";

		const theme = useContext(ThemeContext);
		`;

		const output = `
    import { use } from "react";
    import ThemeContext from "./ThemeContext";

		const theme = use(ThemeContext);
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"), {
			quote: "single",
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			output.replace(/\W/gm, ""),
		);
	});

	it("should replace React.useContext with use", async () => {
		const input = `
    import React from "react";
    import ThemeContext from "./ThemeContext";

		const theme = React.useContext(ThemeContext);
		`;

		const output = `
    import React from "react";
    import ThemeContext from "./ThemeContext";

		const theme = React.use(ThemeContext);
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"), {
			quote: "single",
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			output.replace(/\W/gm, ""),
		);
	});

	it("should not replace any.useContext() with use", async () => {
		const input = `
		import { trpc } from "@calcom/trpc/react";

		export default function hello() {
			const theme = trpc.useContext();
		}
		`;

		const output = `
		import { trpc } from "@calcom/trpc/react";

		export default function hello() {
			const theme = trpc.useContext();
		}
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"), {
			quote: "single",
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			output.replace(/\W/gm, ""),
		);
	});
});
