import { useSnippetStore } from "@studio/store/zustand/snippets";
import type { RangeCommand } from "@studio/utils/tree";

export const useExecuteRangeCommandOnBeforeInput = () => {
  const { setInputSelection } = useSnippetStore();

  return (ranges: RangeCommand) => {
    setInputSelection(ranges);
  };
};
