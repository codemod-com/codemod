import type { Api } from "@codemod.com/workflow";

export async function workflow({ git }: Api) {
  const repo = await git
    .clone([
      "git@github.com:codemod-com/codemod.git",
      { repository: "git@github.com:codemod-com/codemod.git", shallow: true },
    ])
    .branch("convert-console-log-to-error");

  console.log(
    await repo
      .files()
      .js()
      .astGrep("console.log")
      .map(({ getNode }) => getNode().text()),
  );
  // .jsFiles()
  // .astGrep("console.log($$$ARGS)")
  // .replace("console.error($$$ARGS)");
}
