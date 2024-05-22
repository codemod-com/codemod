import type { Api } from "@codemod.com/workflow";

export async function workflow({ jsFiles }: Api) {
  await jsFiles("**/*.{ts,tsx,js,jsx,mjs,cjs}")
    .astGrep("v.string([v.email()])")
    .replace("v.pipe(v.string(), v.email()))");
}
