import dynamic from "next/dynamic";
import { useCallback } from "react";
import type { SnippetType } from "src/pageComponents/main/PageBottomPane";
import type { OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useRanges } from "~/store/useRanges";
import { useRangesOnTarget } from "~/store/useRangesOnTarget";
import { useSnippetStore } from "~/store/zustand/snippets";
import { prettify } from "../../utils/prettify";

const CodeSnippet = dynamic(() => import("~/components/Snippet"), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

type Props = {
	type: SnippetType;
};

export const useSnippet = (type: SnippetType) => {
	const { setInput, setOutput, inputSnippet, outputSnippet } =
		useSnippetStore();

	const snippetValue = type === "before" ? inputSnippet : outputSnippet;

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
