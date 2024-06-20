import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useRanges } from "@studio/store/useRanges";
import { useRangesOnTarget } from "@studio/store/useRangesOnTarget";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { prettify } from "@studio/utils/prettify";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import type { SnippetType } from "./PageBottomPane";

let CodeSnippet = dynamic(() => import("@studio/components/Snippet"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

type Props = {
  type: SnippetType;
};

export let useSnippet = (type: SnippetType) => {
  let { setInput, setOutput, inputSnippet, outputSnippet } =
    useSnippetStore();

  let snippetValue = type === "before" ? inputSnippet : outputSnippet;

  let setRangesOnTarget = useRangesOnTarget();

  let onSnippetChange = useCallback(
    (text?: string) => {
      let val = text ?? "";
      type === "before" ? setInput(val) : setOutput(val);
    },

    [setInput, setOutput, type],
  );

  let onSnippetBlur = () => {
    onSnippetChange(prettify(snippetValue));
  };

  let handleSelectionChange = useCallback(
    (range: OffsetRange) => {
      setRangesOnTarget({
        target: type === "before" ? "BEFORE_INPUT" : "AFTER_INPUT",
        ranges: [range],
      });
    },
    [type, setRangesOnTarget],
  );
  return {
    value: snippetValue,
    onSnippetBlur,
    onSnippetChange,
    handleSelectionChange,
  };
};
let SnippetUI = ({ type }: Props) => {
  let { value, onSnippetBlur, onSnippetChange, handleSelectionChange } =
    useSnippet(type);

  let ranges = useRanges(type);

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full grow">
        <CodeSnippet
          highlights={ranges}
          language="typescript"
          onBlur={onSnippetBlur}
          onChange={onSnippetChange}
          onSelectionChange={handleSelectionChange}
          path={`${type}Snippet.tsx`}
          value={value}
        />
      </div>
    </div>
  );
};

export default SnippetUI;
