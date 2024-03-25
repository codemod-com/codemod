import { Suspense } from "react";
import { PanelGroup } from "react-resizable-panels";
import ResizeHandle from "~/components/ResizePanel/ResizeHandler";
import CodeSnippedPanel, {
	DiffEditorWrapper,
	useCodeDiff,
	WarningTexts,
} from "~/pageComponents/main/JSCodeshiftRender";
import SnippetUI from "~/pageComponents/main/SnippetUI";
import {
	AstSection,
	BottomPanel,
	BoundResizePanel,
	ToggleASTButton,
} from "~/pageComponents/main/bottom-panel/side-components";
import { Panel } from "~/pageComponents/main/bottom-panel/types";
import { useBottomPanel } from "./useBottomPanel";

const PageBottomPane = () => {
	const {
		panelRefs,
		engine,
		togglePanel,
		beforePanel,
		afterPanel,
		outputPanel,
	} = useBottomPanel();

	const panels = [beforePanel, afterPanel, outputPanel];
	const { visibilityOptions: afterPanelVisibility } = afterPanel;
	const codeDiff = useCodeDiff();
	const warningTexts = <WarningTexts {...codeDiff} />;

	return (
		<BottomPanel>
			<Suspense>
				<ToggleASTButton onClick={togglePanel} />
				<BoundResizePanel
					panelRefIndex={Panel.AST_SECTION}
					defaultSize={50}
					panelRefs={panelRefs}
				>
					<PanelGroup direction="horizontal">
						<AstSection panels={panels} engine={engine} panelRefs={panelRefs} />
					</PanelGroup>
				</BoundResizePanel>
				<ResizeHandle direction="vertical" />
				<BoundResizePanel
					defaultSize={50}
					minSize={20}
					panelRefs={panelRefs}
					panelRefIndex={Panel.SNIPPETS_SECTION}
				>
					<PanelGroup direction="horizontal">
						<CodeSnippedPanel
							header="Before"
							panelData={beforePanel}
							panelRefs={panelRefs}
						>
							<SnippetUI type="before" />
						</CodeSnippedPanel>
						<ResizeHandle direction="horizontal" />

						<CodeSnippedPanel
							{...codeDiff}
							header="After (Expected)"
							panelData={afterPanel}
							panelRefs={panelRefs}
						>
							<DiffEditorWrapper
								type="after"
								warnings={warningTexts}
								{...codeDiff}
							/>
						</CodeSnippedPanel>

						<ResizeHandle direction="horizontal" />
						<CodeSnippedPanel
							{...codeDiff}
							header="Output"
							panelData={outputPanel}
							panelRefs={panelRefs}
						>
							<DiffEditorWrapper type="output" {...codeDiff} />
						</CodeSnippedPanel>
					</PanelGroup>
				</BoundResizePanel>
			</Suspense>
		</BottomPanel>
	);
};

export default PageBottomPane;
