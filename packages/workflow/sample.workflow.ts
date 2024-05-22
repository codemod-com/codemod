import { describe, git, jsFiles, migrate } from "@codemod-com/workflow";

migrate("sample migration", () => {
  describe("sample describe", async () => {
    await jsFiles("**/*.ts")
      .astGrep("console.log($A)")
      .replace("console.error($A)");
  });
});
