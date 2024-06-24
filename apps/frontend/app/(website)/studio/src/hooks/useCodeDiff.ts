import { useCodemodOutputUpdate } from "@/app/(website)/studio/features/codemod-apply/useCodemodOutputUpdate";
import { useSnippet } from "@studio/main/SnippetUI";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useRangesOnTarget } from "@studio/store/useRangesOnTarget";
import { useSetActiveEventThunk } from "@studio/store/useSetActiveEventThunk";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetsStore } from "@studio/store/zustand/snippets";
import { TabNames, useViewStore } from "@studio/store/zustand/view";
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
