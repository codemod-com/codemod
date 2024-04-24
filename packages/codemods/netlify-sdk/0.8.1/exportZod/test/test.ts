import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("netlify 0.8.1 export zod", () => {
  it("exports zod to netlify sdk", () => {
    const INPUT = `
            import { z } from 'zod';
        `;

    const OUTPUT = `
            import { z } from '@netlify/sdk'
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
