import {
  describe,
  getAstGrepNodeContext,
  getFileContext,
  jsFiles,
  migrate,
  repositories,
} from "@codemod-com/workflow";
import { identity } from "lodash";

migrate("sample migration", () => {
  describe("sample describe", async () => {
    await repositories`https://github.com/codemod-com/codemod.git`
      .jsFiles`**/*.ts`;
    // await repositories("asdasd", async ({ branches, jsFiles }) => {
    //   await branches`asdas`.jsFiles`asda`;
    //   await jsFiles`asdasd`.astGrep`asdasd`;
    // });
    // const files = await jsFiles`**/*.{tsx,js}`.astGrep`console.log($A)`
    //   .replaceWith`console.error($A)`;
    // console.error(files);
    // const codeOccurencies = await jsFiles`**/*.ts`.astGrep`console.log($A)`.map(
    //   () => {
    //     const { file } = getFileContext();
    //     const { node } = getAstGrepNodeContext();
    //     if (node) {
    //       const range = node.range();
    //       return {
    //         file: `${file}:${range.start.line + 1}:${range.start.column + 1}`,
    //         code: node.text(),
    //       };
    //     }
    //   },
    // );

    // console.log(codeOccurencies.filter(identity));
    // console.log("done");
  });
});
