import { SnippetType } from "~/pageComponents/main/PageBottomPane";
import { useCodemodOutputStore } from "~/zustand/stores/codemodOutput";
import { useSnippetStore } from "~/zustand/stores/snippets";

export const useRanges = (type: SnippetType) => {
	const { beforeSnippetSelectionRanges, afterSnippetSelectionRanges } =
		useSnippetStore();
	const { ranges } = useCodemodOutputStore();

	return {
		before: beforeSnippetSelectionRanges,
		after: afterSnippetSelectionRanges,
		output: ranges,
	}[type];
};
