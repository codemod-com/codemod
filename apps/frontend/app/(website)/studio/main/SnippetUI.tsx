import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useRanges } from "@studio/store/useRanges";
import { useRangesOnTarget } from "@studio/store/useRangesOnTarget";
import { prettify } from "@studio/utils/prettify";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import type { SnippetType } from "./PageBottomPane";
import { useSnippetsStore } from "../src/store/zustand/snippets2";

const CodeSnippet = dynamic(() => import("@studio/components/Snippet"), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

type Props = {
	type: SnippetType;
};

export const useSnippet = (type: SnippetType) => {
	const { setBeforeSnippet, setAfterSnippet, beforeSnippet, afterSnippet } = useSnippetsStore().getSelectedEditors();


	const snippetValue = type === "before" ? beforeSnippet : afterSnippet;

	const setRangesOnTarget = useRangesOnTarget();

	const onSnippetChange = useCallback(
		(text?: string) => {
			const val = text ?? "";
			type === "before" ? setBeforeSnippet(val) : setAfterSnippet(val);
		},

		[setBeforeSnippet, setAfterSnippet, type],
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
					highlights={ ranges }
					language="typescript"
					onBlur={ onSnippetBlur }
					onChange={ onSnippetChange }
					onSelectionChange={ handleSelectionChange }
					path={ `${ type }Snippet.tsx` }
					value={ value }
				/>
			</div>
		</div>
	);
};

export default SnippetUI;
