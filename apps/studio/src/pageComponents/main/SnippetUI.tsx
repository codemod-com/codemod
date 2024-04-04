import dynamic from "next/dynamic";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { SnippetType } from "src/pageComponents/main/PageBottomPane";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useRangesOnTarget } from "~/store/useRangesOnTarget";
import {
	selectSnippets,
	selectSnippetsFor,
	setInput,
	setOutput,
} from "../../store/slices/snippets";
import { prettify } from "../../utils/prettify";
import { useSnippetStore } from "~/store/zustand/snippets";
import { useCodemodOutputStore } from "~/store/zustand/codemodOutput";
import { useRanges } from "~/store/useRanges";

const CodeSnippet = dynamic(() => import("~/components/Snippet"), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

type Props = {
	type: SnippetType;
};

export const useSnippet = (type: SnippetType) => {
	const state = useSelector(selectSnippets);

	const {setInput, setOutput} = useSnippetStore()

	const valueKey = type === "before" ? "inputSnippet" : "outputSnippet";

	const setRangesOnTarget = useRangesOnTarget()
	const value = state[valueKey];

	const onSnippetChange = useCallback(
		(text?: string) => {
			const val = text ?? "";
			type === "before" ? setInput(val) : setOutput(val)
		},

		[setInput, setOutput, type],
	);

	const onSnippetBlur = useCallback(() => {
		onSnippetChange(prettify(value));
	}, [onSnippetChange, value]);

	const handleSelectionChange = useCallback(
		(range: OffsetRange) => {
			setRangesOnTarget({
					target: type === "before" ? "BEFORE_INPUT" : "AFTER_INPUT",
					ranges: [range],
				})
		},
		[type, setRangesOnTarget],
	);
	return {
		value,
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
