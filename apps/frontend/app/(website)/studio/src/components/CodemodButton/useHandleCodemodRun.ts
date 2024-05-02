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
      !isCodemodSourceNotEmpty
    ) {
      return;
    }

    await onCodemodRun({
      engine,
      target: selectedRepository.full_name,
      source: internalContent,
      branch: selectedBranch,
      targetPath: targetPathInput === "" ? undefined : targetPathInput,
    });
  };
};
