import type { Api } from "@codemod.com/workflow";

export async function workflow({ git }: Api) {
  await git
    .clone("git@github.com:codemod-com/codemod.git")
    .branch("convert-console-log-to-error")
    .files()
    .jsFam()
    .astGrep("console.log($$$ARGS)")
    .replace("console.error($$$ARGS)");
}
