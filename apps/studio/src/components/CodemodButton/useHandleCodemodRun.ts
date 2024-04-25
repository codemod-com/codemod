import type { GithubRepository } from "be-types";
import { useCodemodExecution } from "~/hooks/useCodemodExecution";
import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";

export const useHandleCodemodRun = (
  selectedRepository: GithubRepository | undefined,
) => {
  const { onCodemodRun } = useCodemodExecution();
  const { engine } = useSnippetStore();
  const { internalContent } = useModStore();
  const isCodemodSourceNotEmpty = internalContent?.trim() !== "";

  return async () => {
    if (
      selectedRepository === undefined ||
      internalContent === null ||
      !isCodemodSourceNotEmpty
    ) {
      return;
    }

    await onCodemodRun({
      engine,
      target: selectedRepository.full_name,
      source: internalContent,
    });
  };
};
