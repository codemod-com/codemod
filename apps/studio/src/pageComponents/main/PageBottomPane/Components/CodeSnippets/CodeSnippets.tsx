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
import Layout from "../../../Layout";

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
	const devidedToPanels = (
		<>
			<Layout.ResizablePanel minSize={0} defaultSize={50}>
				<>
					{snippetPanels[0]}
					{snippetPanels[1]}
				</>
			</Layout.ResizablePanel>
			<Layout.ResizablePanel minSize={0} defaultSize={50}>
				{snippetPanels[2]}
			</Layout.ResizablePanel>
		</>
	);
	return <> {snippetPanels} </>;
};
