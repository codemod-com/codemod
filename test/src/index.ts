import type { Api } from "@codemod-com/workflow";

export async function workflow({ jsFiles }: Api) {
  await jsFiles("**/*.ts")
    .astGrep("console.log($A)")
    .replace("console.error($A)");
}
