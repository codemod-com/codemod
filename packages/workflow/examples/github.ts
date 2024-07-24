import type { Api } from "../src/index.js";

export async function workflow({ github }: Api) {
  await github.fork`git@github.com:codemod-com/codemod.git`.clone(
    async ({ branch, codemod, commit, push, pr }) => {
      await branch("pnpm-catalog");
      await codemod("pnpm/catalog");
      await commit("migration to pnpm catalog");
      await push();
      await pr(
        "chore: pnpm catalog migration",
        `# Migration to pnpm catalog
## Updated description
This PR migrates to the [pnpm catalog](https://pnpm.io/catalogs), a new feature that is available starting pnpm@9.5.0
Using [pnpm catalog codemod](https://codemod.com/registry/pnpm-catalog).
PR is safe to merge.
`,
      );
    },
  );
}
