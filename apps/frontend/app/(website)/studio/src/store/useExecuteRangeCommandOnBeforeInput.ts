import type { RangeCommand } from "@studio/utils/tree";
import { useSnippetsStore } from "@studio/store/zustand/snippets2";

export const useExecuteRangeCommandOnBeforeInput = () => {
	const { getSelectedEditors } = useSnippetsStore();

	return (ranges: RangeCommand) => {
		getSelectedEditors().setSelection('before')(ranges);
	};
};
