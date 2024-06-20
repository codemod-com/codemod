import { useCodemodOutputUpdate } from "@/app/(website)/studio/features/codemod-apply/useCodemodOutputUpdate";
import { useSnippet } from "@studio/main/SnippetUI";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useRangesOnTarget } from "@studio/store/useRangesOnTarget";
import { useSetActiveEventThunk } from "@studio/store/useSetActiveEventThunk";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useModStore } from "@studio/store/zustand/mod";
import { TabNames, useViewStore } from "@studio/store/zustand/view";
import { useCallback } from "react";
import { useSnippetsStore } from "@studio/store/zustand/snippets2";

export const useCodeDiff = () => {
	const { getSelectedEditors } = useSnippetsStore();
	const { afterSnippet, after: { ranges: afterInputRanges } } = getSelectedEditors()
	const setRangeThunk = useRangesOnTarget();
	const { internalContent } = useModStore();

	const { ranges, content } = useCodemodOutputStore();
	const setActiveEventThunk = useSetActiveEventThunk();

	const { value, handleSelectionChange, onSnippetChange } = useSnippet("after");

	const { setActiveTab } = useViewStore();

	const snippetBeforeHasOnlyWhitespaces = !/\S/.test(afterSnippet);
	const codemodSourceHasOnlyWhitespaces = !/\S/.test(internalContent ?? "");

	const onSelectionChange = useCallback(
		(range: OffsetRange) => {
			setRangeThunk({
				target: "CODEMOD_OUTPUT",
				ranges: [range],
			});
		},
		[setRangeThunk],
	);

	const { firstCodemodExecutionErrorEvent } = useCodemodOutputUpdate();

	const onDebug = () => {
		firstCodemodExecutionErrorEvent?.hashDigest &&
		setActiveEventThunk(firstCodemodExecutionErrorEvent.hashDigest);
		setActiveTab(TabNames.DEBUG);
	};

	const originalEditorProps = {
		highlights: afterInputRanges,
		onSelectionChange: handleSelectionChange,
		onChange: onSnippetChange,
		value,
	};

	const modifiedEditorProps = {
		highlights: ranges,
		onSelectionChange,
		value: content ?? "",
	};

	return {
		codemodSourceHasOnlyWhitespaces,
		snippetBeforeHasOnlyWhitespaces,
		firstCodemodExecutionErrorEvent,
		onDebug,
		originalEditorProps,
		modifiedEditorProps,
	};
};
