/*
The MIT License (MIT)

Copyright (c) 2023 Vercel, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
Changes to the original input and output variables that were incorporated from https://github.com/vercel/next.js/pull/45970: formatting
*/

import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("new-image-experimental", () => {
  const INPUT = `
		const withPwa = (opts) => {
			// no-op but image this adds props
			return opts
		  }
		  module.exports = withPwa({
			images: {
			  loader: "cloudinary",
			  path: "https://example.com/",
			},
		  })
	`;

  const OUTPUT = `
		const withPwa = (opts) => {
			// no-op but image this adds props
			return opts
		  }
		  module.exports = withPwa({
			images: {
			  loader: "custom",
			  loaderFile: "./cloudinary-loader.js",
			},
		  })
	`;

  it("should replace next.config.ts with the tsx parser", () => {
    const fileInfo: FileInfo = {
      path: "next.config.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi(), {
      dryRun: true,
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should replace next.config.ts with the recast parser", () => {
    const fileInfo: FileInfo = {
      path: "next.config.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi(undefined), {
      dryRun: true,
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
