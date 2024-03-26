import CodeSnippedPanel, {
	useCodeDiff,
	WarningTexts,
} from "~/pageComponents/main/JSCodeshiftRender";
import { getSnippetsData } from "~/pageComponents/main/PageBottomPane/Components/CodeSnippets/get-snippets-data";
import {
	BottomPanel,
	PanelRefs,
} from "~/pageComponents/main/PageBottomPane/utils/types";

type CodeSnippetsProps = BottomPanel & {
	onlyAfterHidden: boolean;
	panelRefs: PanelRefs;
};
export const CodeSnippets = ({
	beforePanel,
	afterPanel,
	outputPanel,
	onlyAfterHidden,
	panelRefs,
}: CodeSnippetsProps) => {
	const codeDiff = useCodeDiff();
	const warnings = <WarningTexts {...codeDiff} />;
	const snippetPanels = getSnippetsData({
		warnings,
		beforePanel,
		afterPanel,
		outputPanel,
		onlyAfterHidden,
	}).map(({ Snipped, extras, diffEditorWrapper, ...codeSnippedPanel }) => (
		<>
			<CodeSnippedPanel panelRefs={panelRefs} {...codeSnippedPanel}>
				<Snipped
					{...{
						...diffEditorWrapper,
						...codeDiff,
					}}
				/>
			</CodeSnippedPanel>
			{extras}
		</>
	));
	return <> {snippetPanels} </>;
};
