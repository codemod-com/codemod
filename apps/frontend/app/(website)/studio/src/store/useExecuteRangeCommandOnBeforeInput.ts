import { useSnippetsStore } from "@studio/store/zustand/snippets";
import type { RangeCommand } from "@studio/utils/tree";

export const useExecuteRangeCommandOnBeforeInput = () => {
  const { getSelectedEditors } = useSnippetsStore();

  return (ranges: RangeCommand) => {
    getSelectedEditors().setSelection("before")(ranges);
  };
};
