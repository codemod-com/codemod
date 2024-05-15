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
    // const files = await jsFiles`**/*.{tsx,js}`.astGrep`console.log($A)`
    //   .replaceWith`console.error($A)`;
    // console.error(files);
    const codeOccurencies = await jsFiles`**/*.ts`.astGrep`console.log($A)`.map(
      async () => {
        const { file } = getFileContext();
        const { node } = getAstGrepNodeContext();
        if (node) {
          return {
            file,
            code: node.text(),
            ...node.range().start,
          };
        }
      },
    );

    console.log(codeOccurencies.filter(identity));
  });
});
