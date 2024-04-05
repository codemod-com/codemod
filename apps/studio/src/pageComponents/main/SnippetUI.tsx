import dynamic from "next/dynamic";
import { useCallback } from "react";
import { SnippetType } from "src/pageComponents/main/PageBottomPane";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { DEFAULT_TEST_FIXTURE_DIR } from "~/store/getInitialState";
import { useRanges } from "~/store/useRanges";
import { useRangesOnTarget } from "~/store/useRangesOnTarget";
import { useFilesStore } from "~/store/zustand/file";
import { prettify } from "../../utils/prettify";

const CodeSnippet = dynamic(() => import("~/components/Snippet"), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

type Props = {
	type: SnippetType;
};

export const useSnippet = (type: SnippetType) => {
	const { selectFirst, upsertOne } = useFilesStore();

	const file = selectFirst({
		parent: DEFAULT_TEST_FIXTURE_DIR.hashDigest,
		name: `${type}.tsx`,
	});

	const snippetValue = file?.content ?? "";

	const setRangesOnTarget = useRangesOnTarget();

	const onSnippetChange = useCallback(
		(text?: string) => {
			if (!file) {
				return;
			}

			const val = text ?? "";
			upsertOne(file?.hashDigest, { ...file, content: val });
		},

		[upsertOne, file?.hashDigest],
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
