import { describe, git, migrate } from "@codemod-com/workflow";

migrate("sample migration", () => {
  describe("sample describe", async () => {
    const changes = await git.clone`git@github.com:codemod-com/codemod.git`
      .jsFiles`**/*.ts`.astGrep`console.log($A)`.replace`console.error($A)`.map(
      ({ getNode }) => getNode().text(),
    );
    console.log({ changes });
  });
});
