import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("ember 5 jquery-event", () => {
  it("basic", () => {
    const INPUT = `
		// your event handler:
        export default Component.extend({
        click(event) {
        let x = event.originalEvent.clientX;
        }
        });
		`;

    const OUTPUT = `
		// your event handler:
        export default Component.extend({
        click(event) {
        let x = event.clientX;
        }
        });
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
