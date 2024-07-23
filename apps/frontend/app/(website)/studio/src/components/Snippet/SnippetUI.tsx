import { defaultOptions } from "@studio/components/Snippet/consts";
import type { SnippetType } from "@studio/main/PageBottomPane";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useSnippetsStore } from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import { prettify } from "@studio/utils/prettify";
import dynamic from "next/dynamic";

const CodeSnippet = dynamic(() => import("@studio/components/Snippet/index"), {
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

  const setRangesOnTarget = useRangesOnTarget();

  const onSnippetChange = (text?: string) => {
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
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full grow">
        <CodeSnippet
          options={defaultOptions}
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
