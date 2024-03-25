import { Suspense } from "react";
import { PanelGroup } from "react-resizable-panels";
import ResizeHandle from "~/components/ResizePanel/ResizeHandler";
import LiveCodemodSnipped, {
	useCodeDiff,
	WarningTexts,
} from "~/pageComponents/main/JSCodeshiftRender";
import {
	AstSection,
	BeforeCodeSnippedPanel,
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
						<BeforeCodeSnippedPanel
							beforePanel={beforePanel}
							panelRefs={panelRefs}
						/>
						<ResizeHandle direction="horizontal" />
						<LiveCodemodSnipped
							{...codeDiff}
							type="after"
							header="After (Expected)"
							panelData={afterPanel}
							panelRefs={panelRefs}
						>
							{warningTexts}
						</LiveCodemodSnipped>

						<ResizeHandle direction="horizontal" />
						<LiveCodemodSnipped
							{...codeDiff}
							type="output"
							header="Output"
							panelData={afterPanel}
							panelRefs={panelRefs}
						>
							{warningTexts}
						</LiveCodemodSnipped>
						{/*</BoundResizePanel>*/}
					</PanelGroup>
				</BoundResizePanel>
			</Suspense>
		</BottomPanel>
	);
};

export default PageBottomPane;
