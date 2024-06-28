import { useCodemodOutputUpdate } from "@/app/(website)/studio/features/codemod-apply/useCodemodOutputUpdate";
import { useSnippet } from "@studio/main/SnippetUI";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import { useSetActiveEventThunk } from "@studio/store/utils/useSetActiveEventThunk";
import { TabNames, useViewStore } from "@studio/store/view";
import { useCallback } from "react";

export const useCodeDiff = () => {
  const { getSelectedEditors } = useSnippetsStore();
  const {
    outputSnippet,
    afterSnippet,
    after: { ranges: afterInputRanges },
    output: { ranges: outputRanges },
  } = getSelectedEditors();
  const setRangeThunk = useRangesOnTarget();
  const { internalContent } = useModStore();
  const setActiveEventThunk = useSetActiveEventThunk();

  const { value, handleSelectionChange, onSnippetChange, onSnippetBlur } =
    useSnippet("after");

  const { setActiveTab } = useViewStore();

  const snippetBeforeHasOnlyWhitespaces = !/\S/.test(afterSnippet);
  const codemodSourceHasOnlyWhitespaces = !/\S/.test(internalContent ?? "");

  const onSelectionChange = (range: OffsetRange) => {
    setRangeThunk({
      target: "CODEMOD_OUTPUT",
      ranges: [range],
    });
  };

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
    onBlur: onSnippetBlur,
    highlights: outputRanges,
    onSelectionChange,
    value: outputSnippet ?? "",
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
