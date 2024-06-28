import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useSnippetsStore } from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import { prettify } from "@studio/utils/prettify";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import type { SnippetType } from "./PageBottomPane";

const CodeSnippet = dynamic(() => import("@studio/components/Snippet"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

type Props = {
  type: SnippetType;
};

export const useSnippet = (type: SnippetType) => {
  const { getSelectedEditors } = useSnippetsStore();
  const {
    [type]: { ranges, content: snippetValue },
  } = getSelectedEditors();
  console.log("useSnippet");

  const setRangesOnTarget = useRangesOnTarget();

  const onSnippetChange = (text?: string) => {
    console.log("onSnippetChange", { text });
    const val = text ?? "";
    const { setContent } = getSelectedEditors();
    setContent(type)(val);
  };

  const onSnippetBlur = (val) => {
    onSnippetChange(prettify(val));
  };

  const handleSelectionChange = (range: OffsetRange) => {
    setRangesOnTarget({
      target: type === "before" ? "BEFORE_INPUT" : "AFTER_INPUT",
      ranges: [range],
    });
  };

  return {
    value: snippetValue,
    onSnippetBlur,
    onSnippetChange,
    handleSelectionChange,
    ranges,
  };
};
const SnippetUI = ({ type }: Props) => {
  const {
    value,
    onSnippetBlur,
    onSnippetChange,
    handleSelectionChange,
    ranges,
  } = useSnippet(type);
  console.log("SnippetUI");
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
