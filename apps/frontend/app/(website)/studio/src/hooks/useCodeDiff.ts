import { useCodemodOutputUpdate } from "@/app/(website)/studio/features/codemod-apply/useCodemodOutputUpdate";
import { useSnippet } from "@studio/main/SnippetUI";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useRangesOnTarget } from "@studio/store/useRangesOnTarget";
import { useSetActiveEventThunk } from "@studio/store/useSetActiveEventThunk";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { TabNames, useViewStore } from "@studio/store/zustand/view";
import { useCallback } from "react";

export let useCodeDiff = () => {
  let { inputSnippet, afterInputRanges } = useSnippetStore();
  let setRangeThunk = useRangesOnTarget();
  let { internalContent } = useModStore();

  let { ranges, content } = useCodemodOutputStore();
  let setActiveEventThunk = useSetActiveEventThunk();

  let { value, handleSelectionChange, onSnippetChange } = useSnippet("after");

  let { setActiveTab } = useViewStore();

  let snippetBeforeHasOnlyWhitespaces = !/\S/.test(inputSnippet);
  let codemodSourceHasOnlyWhitespaces = !/\S/.test(internalContent ?? "");

  let onSelectionChange = useCallback(
    (range: OffsetRange) => {
      setRangeThunk({
        target: "CODEMOD_OUTPUT",
        ranges: [range],
      });
    },
    [setRangeThunk],
  );

  let { firstCodemodExecutionErrorEvent } = useCodemodOutputUpdate();

  let onDebug = () => {
    firstCodemodExecutionErrorEvent?.hashDigest &&
      setActiveEventThunk(firstCodemodExecutionErrorEvent.hashDigest);
    setActiveTab(TabNames.DEBUG);
  };

  let originalEditorProps = {
    highlights: afterInputRanges,
    onSelectionChange: handleSelectionChange,
    onChange: onSnippetChange,
    value,
  };

  let modifiedEditorProps = {
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
