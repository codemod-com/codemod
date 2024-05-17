import type { SnippetType } from "@studio/main/PageBottomPane";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useSnippetStore } from "@studio/store/zustand/snippets";

export let useRanges = (type: SnippetType) => {
  let { beforeInputRanges, afterInputRanges } = useSnippetStore();
  let { ranges } = useCodemodOutputStore();

  return {
    before: beforeInputRanges,
    after: afterInputRanges,
    output: ranges,
  }[type];
};
