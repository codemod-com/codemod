import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("mui/5/core-styles-import", () => {
  it("basic test", () => {
    const INPUT = `
        import { darken, lighten } from '@material-ui/core/styles/colorManipulator';
		import { Overrides } from '@material-ui/core/styles/overrides';
		import makeStyles from '@material-ui/core/styles/makeStyles';
		import { createTheme } from '@material-ui/core/styles';
        `;

    const OUTPUT = `
        import { createTheme, darken, lighten, Overrides, makeStyles } from '@material-ui/core/styles';
        `;

    const fileInfo: FileInfo = {
      path: "index.ts",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
