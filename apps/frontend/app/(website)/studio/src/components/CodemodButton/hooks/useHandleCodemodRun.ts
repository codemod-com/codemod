import { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import type { GHBranch, GithubRepository } from "be-types";
import { transpileTs } from "../../../utils/transpileTs";
type Props = {
  codemodName?: string;
  selectedRepository: GithubRepository | undefined;
  selectedBranch: GHBranch | undefined;
};
export let useHandleCodemodRun = ({
  codemodName,
  selectedRepository,
  selectedBranch,
}: Props) => {
  let { onCodemodRun } = useCodemodExecution();
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
