import { Suspense, useEffect } from "react";
import { PanelGroup } from "react-resizable-panels";
import ResizeHandle from "~/components/ResizePanel/ResizeHandler";
import { CodeSnippets } from "~/pageComponents/main/PageBottomPane/Components/CodeSnippets/CodeSnippets";
import {
	AstSection,
	BottomPanel,
	BoundResizePanel,
	ToggleASTButton,
} from "~/pageComponents/main/PageBottomPane/Components/side-components";
import { inferVisibilities } from "~/pageComponents/main/PageBottomPane/utils/infer-visibilites";
import {
	Panel,
	PanelData,
} from "~/pageComponents/main/PageBottomPane/utils/types";
import { Repeat } from "~/types/transformations";
import { useBottomPanel } from "./hooks/useBottomPanel";

const PageBottomPane = () => {
	const {
		panelRefs,
		engine,
		togglePanel,
		beforePanel,
		afterPanel,
		outputPanel,
	} = useBottomPanel();

	const panels: Repeat<PanelData, 3> = [beforePanel, afterPanel, outputPanel];
	const { onlyAfterHidden } = inferVisibilities(panels);

	useEffect(() => {
		if (onlyAfterHidden) {
			panelRefs.current[afterPanel.snippedIndex]?.collapse();
		} else {
			panels.forEach(({ snippedIndex }) =>
				panelRefs.current[snippedIndex]?.resize(33),
			);
		}
	}, [onlyAfterHidden]);

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
						<CodeSnippets
							panelRefs={panelRefs}
							onlyAfterHidden={onlyAfterHidden}
							afterPanel={afterPanel}
							beforePanel={beforePanel}
							outputPanel={outputPanel}
						/>
					</PanelGroup>
				</BoundResizePanel>
			</Suspense>
		</BottomPanel>
	);
};

export default PageBottomPane;
