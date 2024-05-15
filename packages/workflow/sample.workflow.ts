import { describe, jsFiles, migrate } from "@codemod-com/workflow";

migrate("sample migration", () => {
  describe("sample describe", async () => {
    const files = await jsFiles`**/*.ts`.astGrep`console.log($A)`;
    console.log(files);
  });
});
