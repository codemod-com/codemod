import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("Context.Provider -> Context", () => {
	it("should replace Context.Provider with Context", async () => {
		const input = `
		function App() {
			const [theme, setTheme] = useState('light');

			return (
			  <ThemeContext.Provider value={theme}>
				<Page />
			  </ThemeContext.Provider>
			);
		  }
		`;

		const output = `
		function App() {
			const [theme, setTheme] = useState('light');

			return (
			  <ThemeContext value={theme}>
				<Page />
			  </ThemeContext>
			);
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
