import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 index-router", () => {
  it('Should replace IndexRoute with Route with "exact" prop', async () => {
    const input = `
		const App = () => (
			<div>
				<IndexRoute component={Home} />;
			</div>
		);
		`;

    const output = `
		const App = () => (
			<div>
				<Route exact path="/" component={Home} />;
			</div>
		);		
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
