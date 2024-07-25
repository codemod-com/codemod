import assert from "node:assert/strict";
import jscodeshift, { type FileInfo, type API } from "jscodeshift";

import { describe, it } from "vitest";
import { getClassComponents, getFunctionComponents } from "../src/index.js";

const buildApi = (parser: string | undefined): API => ({
  j: parser ? jscodeshift.withParser(parser) : jscodeshift,
  jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
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

const buildRootCollection = (file: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  return { j, root };
};

describe("react utils", async () => {
  describe("getClassComponents", async () => {
    it("Should support named import aliases", async () => {
      const INPUT = `
                import React1, { Component as Component1 } from 'react';
        
                class A extends React1.PureComponent {}
                class B extends Component1 {}

                class C extends React.Component {}
                class D extends React1.Something {}
                class F extends React1.Component {}
            `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      const components = getClassComponents(j, root);

      assert.deepEqual(
        components?.paths().map((p) => p.value.id.name),
        ["A", "B", "F"],
      );
      assert.ok(components?.paths().length === 3);
    });
  });

  describe("getFunctionComponents", async () => {
    it("Should support named import aliases", async () => {
      const INPUT = `
                const A = () => {
                return <></>
                }
            `;

      const fileInfo: FileInfo = {
        path: "index.js",
        source: INPUT,
      };

      const { j, root } = buildRootCollection(fileInfo, buildApi("tsx"));

      const components = getFunctionComponents(j, root);
      assert.ok(components?.paths().length === 1);
    });
  });
});
