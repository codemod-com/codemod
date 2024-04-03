import dynamic from "next/dynamic";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { SnippetType } from "src/pageComponents/main/PageBottomPane";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useAppDispatch } from "~/store";
import { setRangeThunk } from "~/store/useRangeStore";
import {
	selectSnippets,
	selectSnippetsFor,
	setInput,
	setOutput,
} from "../../store/slices/snippets";
import { prettify } from "../../utils/prettify";

const CodeSnippet = dynamic(() => import("~/components/Snippet"), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

type Props = {
	type: SnippetType;
};

export const useSnippet = (type: SnippetType) => {
	const state = useSelector(selectSnippets);

	const dispatch = useAppDispatch();

	const valueKey = type === "before" ? "inputSnippet" : "outputSnippet";

	const value = state[valueKey];

	const onSnippetChange = useCallback(
		(text?: string) => {
			const val = text ?? "";
			dispatch(type === "before" ? setInput(val) : setOutput(val));
		},

		[dispatch, type],
	);

	const onSnippetBlur = useCallback(() => {
		onSnippetChange(prettify(value));
	}, [onSnippetChange, value]);

	const handleSelectionChange = useCallback(
		(range: OffsetRange) => {
			dispatch(
				setRangeThunk({
					target: type === "before" ? "BEFORE_INPUT" : "AFTER_INPUT",
					ranges: [range],
				}),
			);
		},
		[dispatch, type],
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

	const { ranges } = useSelector(selectSnippetsFor(type));

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
