import { RangeCommand } from "~/utils/tree";
import { useSnippetStore } from "~/zustand/stores/snippets";

export const useExecuteRangeCommandOnBeforeInput = () => {
	const { setInputSelection } = useSnippetStore();

	return (ranges: RangeCommand) => {
		setInputSelection(ranges);
	};
};
