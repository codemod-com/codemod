import { SnippetType } from "~/pageComponents/main/PageBottomPane";
import { useSnippetStore } from "~/store/zustand/snippets";
import { useCodemodOutputStore } from "~/store/zustand/codemodOutput";

export const useRanges = (type: SnippetType) => {
	const {beforeInputRanges, afterInputRanges} = useSnippetStore();
	const { ranges } = useCodemodOutputStore()

	return ({
		'before': beforeInputRanges,
		'after': afterInputRanges,
		'output': ranges
	})[type]
}