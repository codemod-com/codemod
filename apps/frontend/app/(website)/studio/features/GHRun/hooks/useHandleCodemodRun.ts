import type { CodemodRunRequest } from "@shared/types";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { transpileTs } from "@studio/utils/transpileTs";
import type { GHBranch, GithubRepository } from "be-types";

type Props = {
  onCodemodRun: (request: CodemodRunRequest) => Promise<void>;
  codemodName?: string;
  selectedRepository: GithubRepository | undefined;
  selectedBranch: GHBranch | undefined;
};
export let useHandleCodemodRun = ({
  onCodemodRun,
  codemodName,
  selectedRepository,
  selectedBranch,
}: Props) => {
  let { engine } = useSnippetStore();
  let { internalContent } = useModStore();
  let isCodemodSourceNotEmpty = internalContent?.trim() !== "";

  return async () => {
    if (
      !codemodName ||
      selectedRepository === undefined ||
      selectedBranch === undefined ||
      internalContent === null ||
      !isCodemodSourceNotEmpty ||
      !(engine === "jscodeshift" || engine === "ts-morph") // other engines are not supported by backend API
    ) {
      return;
    }

    let request = {
      codemodEngine: engine,
      repoUrl: selectedRepository.html_url,
      codemodSource: await transpileTs(internalContent),
      codemodName,
      branch: selectedBranch.name,
    };

    await onCodemodRun(request);
  };
};
