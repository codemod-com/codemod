import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 rename-imports", () => {
  it('should replace "react-router" import with "react-router-dom"', async () => {
    const input = `import { Redirect, Route } from 'react-router';`;

    const output = `import { Redirect, Route } from 'react-router-dom';`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi("ts"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      output.replace(/\W/gm, ""),
    );
  });

  it("example 1 from netlify-react-ui", async () => {
    const input = `import { browserHistory } from 'react-router';`;

    const output = `import { browserHistory } from 'react-router-dom';`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi("ts"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      output.replace(/\W/gm, ""),
    );
  });

  it("example 2 from netlify-react-ui", async () => {
    const input = `import type { WithRouterProps } from 'react-router';`;

    const output = `import type { WithRouterProps } from 'react-router-dom';`;

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi("ts"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      output.replace(/\W/gm, ""),
    );
  });

  it("example 3 from netlify-react-ui", async () => {
    const input = `import { createMemoryHistory, Route, Router } from 'react-router';`;

    const output = `import { createMemoryHistory, Route, Router } from 'react-router-dom';`;

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi("ts"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      output.replace(/\W/gm, ""),
    );
  });
});
