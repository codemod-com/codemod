import type { SnippetType } from "@studio/main/PageBottomPane";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useSnippetsStore } from "./zustand/snippets";

export const useRanges = (type: SnippetType) => {
  const { getSelectedEditors } = useSnippetsStore();
  const { ranges } = useCodemodOutputStore();

  return {
    before: getSelectedEditors().before.ranges,
    after: getSelectedEditors().after.ranges,
    output: ranges,
  }[type];
};
