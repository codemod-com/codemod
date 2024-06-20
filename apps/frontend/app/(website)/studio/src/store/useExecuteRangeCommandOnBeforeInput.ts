import { useSnippetStore } from "@studio/store/zustand/snippets";
import type { RangeCommand } from "@studio/utils/tree";

export let useExecuteRangeCommandOnBeforeInput = () => {
  let { setInputSelection } = useSnippetStore();

  return (ranges: RangeCommand) => {
    setInputSelection(ranges);
  };
};
