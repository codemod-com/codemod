import { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import type { GithubRepository } from "be-types";

export const useHandleCodemodRun = (
  codemodName: string,
  selectedRepository: GithubRepository | undefined,
  selectedBranch: { name: string } | undefined,
) => {
  const { onCodemodRun } = useCodemodExecution();
  const { engine } = useSnippetStore();
  const { internalContent } = useModStore();
  const isCodemodSourceNotEmpty = internalContent?.trim() !== "";

  return async () => {
    if (
      selectedRepository === undefined ||
      selectedBranch === undefined ||
      internalContent === null ||
      !isCodemodSourceNotEmpty ||
      !(engine === "jscodeshift" || engine === "ts-morph") // other engines are not supported by backend API
    ) {
      return;
    }

    const request = {
      codemodEngine: engine,
      repoUrl: selectedRepository.html_url,
      codemodSource: internalContent,
      codemodName,
      branch: selectedBranch.name,
    };

    await onCodemodRun(request);
  };
};
