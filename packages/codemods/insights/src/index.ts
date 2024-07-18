import { type Api, api } from "@codemod.com/workflow";
import npmCheck from "npm-check";

type Options = {
  repos: string[];
};

export async function workflow({ git }: Api, options: Options) {
  await git.clone(options.repos);

  const currentState = await npmCheck({
    skipUnused: true,
    // @TODO how to get directory of the cloned repo?
    cwd: "/var/folders/lb/jyy18cts4zb3xnwqs876921w0000gn/T/cm/git-github-com-dmytro-hryshyn-feature-flag-example-git-0",
  });

  console.log(currentState.get("packages"));
  // @TODO
}

workflow(api, {
  repos: ["git@github.com:DmytroHryshyn/feature-flag-example.git"],
});
