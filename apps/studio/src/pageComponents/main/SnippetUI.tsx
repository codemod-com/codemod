import dynamic from "next/dynamic";
import { useCallback } from "react";
import { SnippetType } from "src/pageComponents/main/PageBottomPane";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useSnippetStore } from "~/zustand/stores/snippets";
import { useRanges } from "~/zustand/utils/useRanges";
import { useRangesOnTarget } from "~/zustand/utils/useRangesOnTarget";
import { prettify } from "../../utils/prettify";

const CodeSnippet = dynamic(() => import("~/components/Snippet"), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

type Props = {
	type: SnippetType;
};

export const useSnippet = (type: SnippetType) => {
	const {
		setBeforeSnippetText,
		setAfterSnippetText,
		beforeSnippetText,
		afterSnippetText,
	} = useSnippetStore();

	const snippetValue = type === "before" ? beforeSnippetText : afterSnippetText;

	const setRangesOnTarget = useRangesOnTarget();

	const onSnippetChange = useCallback(
		(text?: string) => {
			const val = text ?? "";
			type === "before" ? setBeforeSnippetText(val) : setAfterSnippetText(val);
		},

		[setBeforeSnippetText, setAfterSnippetText, type],
	);

	const onSnippetBlur = useCallback(() => {
		onSnippetChange(prettify(snippetValue));
	}, [onSnippetChange]);

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
