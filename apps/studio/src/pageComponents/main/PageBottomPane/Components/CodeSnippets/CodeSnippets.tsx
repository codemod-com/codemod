import { cn } from "~/lib/utils";
import CodeSnippedPanel, {
	useCodeDiff,
	WarningTexts,
} from "~/pageComponents/main/JSCodeshiftRender";
import { getSnippetsData } from "~/pageComponents/main/PageBottomPane/Components/CodeSnippets/get-snippets-data";
import {
	BottomPanelData,
	PanelRefs,
} from "~/pageComponents/main/PageBottomPane/utils/types";
import { isVisible } from "~/utils/visibility";

type CodeSnippetsProps = BottomPanelData & {
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
			<CodeSnippedPanel
				className={cn(!isVisible(codeSnippedPanel.panelData) && "hidden")}
				panelRefs={panelRefs}
				{...codeSnippedPanel}
			>
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
