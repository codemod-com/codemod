import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/codemod-utils";
import { trimLicense } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("history v4 use-back", () => {
  it("should replace history.goBack() with history.back()", async () => {
    const input = `
		history.goBack();

		const Component = () => {		  
			const handleChange = () => {
			  history.goBack();
			};

			useEffect(() => {
				history.goBack();
			}, []);
		  
			return (
			  <div>
				<Select
				  onChange={handleChange}
				/>
			  </div>
			);
		  };
		`;

    const output = `
		history.back();

		const Component = () => {		  
			const handleChange = () => {
			  history.back();
			};

			useEffect(() => {
				history.back();
			}, []);
		  
			return (
			  <div>
				<Select
				  onChange={handleChange}
				/>
			  </div>
			);
		  };
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: trimLicense(input),
    };

    const actualOutput = transform(fileInfo, buildApi());

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      trimLicense(output).replace(/\W/gm, ""),
    );
  });
});
