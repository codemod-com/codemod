import type { GithubRepository } from "@/types/object.types";
import { useCodemodExecution } from "@studio/hooks/useCodemodExecution";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";

export const useHandleCodemodRun = (
  selectedRepository: GithubRepository | undefined,
  selectedBranch: string | undefined,
  targetPathInput: string,
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

    await onCodemodRun({
      codemodEngine: engine,
      repoUrl: selectedRepository.html_url,
      codemodSource: internalContent,
      codemodName: "untitled", // UI for codemod name is missing
      branch: selectedBranch,
      targetPath: targetPathInput === "" ? undefined : targetPathInput,
    });
  };
};
