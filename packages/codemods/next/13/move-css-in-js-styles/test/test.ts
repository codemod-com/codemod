import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import sinon from "sinon";
import { describe, it } from "vitest";
import transform from "../src/index.js";

const INPUT = `
export default () => (
    <div>
      <p>only this paragraph will get the style :)</p>
          <SomeComponent />
      
        <style jsx>{\`
         p {
          color: red;
         }
        \`}</style>
    </div>
)`;

const OUTPUT = `
import styles from "./index.module.css";

export default () => (
  <div className={styles.wrapper}>
    <p>only this paragraph will get the style :)</p>
        <SomeComponent />
  </div>
)
`;

const STYLE_FILE =
  "\n         p {\n          color: red;\n         }\n        ";

describe("next 13 move-css-in-js-styles", () => {
  it("should remove the style component, add an import and a class name", async () => {
    const fileInfo: FileInfo = {
      path: "/opt/repository/pages/index.js",
      source: INPUT,
    };

    const options = {
      createFile(path: string, data: string) {
        return { path, data };
      },
    };

    const spy = sinon.spy(options);

    const actualOutput = transform(fileInfo, buildApi("js"), options);

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );

    assert.deepEqual(
      spy.createFile.calledOnceWith(
        "/opt/repository/pages/index.module.css",
        STYLE_FILE,
      ),
      true,
    );
  });
});
