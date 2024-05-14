import { Loading } from "@studio/components/Loader";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useRanges } from "@studio/store/useRanges";
import { useRangesOnTarget } from "@studio/store/useRangesOnTarget";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { prettify } from "@studio/utils/prettify";
import { Suspense, lazy, useCallback } from "react";
import type { SnippetType } from "./PageBottomPane";
import("@studio/components/Snippet");

const CodeSnippet = lazy(() => import("@studio/components/Snippet"));

type Props = {
  type: SnippetType;
};

export const useSnippet = (type: SnippetType) => {
  const { setInput, setOutput, inputSnippet, afterSnippet } = useSnippetStore();

  const snippetValue = type === "before" ? inputSnippet : afterSnippet;

  const setRangesOnTarget = useRangesOnTarget();

  const onSnippetChange = useCallback(
    (text?: string) => {
      const val = text ?? "";
      type === "before" ? setInput(val) : setOutput(val);
    },

    [setInput, setOutput, type],
  );

  const onSnippetBlur = () => {
    onSnippetChange(prettify(snippetValue));
  };

  const handleSelectionChange = useCallback(
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
const SnippetUI = ({ type }: Props) => {
  const { value, onSnippetBlur, onSnippetChange, handleSelectionChange } =
    useSnippet(type);

  const ranges = useRanges(type);

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full grow">
        <Suspense fallback={<Loading />}>
          <CodeSnippet
            highlights={ranges}
            language="typescript"
            onBlur={onSnippetBlur}
            onChange={onSnippetChange}
            onSelectionChange={handleSelectionChange}
            path={`${type}Snippet.tsx`}
            value={value}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default SnippetUI;
