import type { SnippetType } from "studio/main/PageBottomPane";
import { useCodemodOutputStore } from "~/store/zustand/codemodOutput";
import { useSnippetStore } from "~/store/zustand/snippets";

export const useRanges = (type: SnippetType) => {
	const { beforeInputRanges, afterInputRanges } = useSnippetStore();
	const { ranges } = useCodemodOutputStore();

	return {
		before: beforeInputRanges,
		after: afterInputRanges,
		output: ranges,
	}[type];
};
