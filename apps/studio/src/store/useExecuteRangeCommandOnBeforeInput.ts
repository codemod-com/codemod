import { useSnippetStore } from "~/store/zustand/snippets";
import type { RangeCommand } from "~/utils/tree";

export const useExecuteRangeCommandOnBeforeInput = () => {
  const { setInputSelection } = useSnippetStore();

  return (ranges: RangeCommand) => {
    setInputSelection(ranges);
  };
};
