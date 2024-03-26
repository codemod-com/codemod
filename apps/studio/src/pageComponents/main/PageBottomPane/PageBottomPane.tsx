import { Suspense, useEffect } from "react";
import { PanelGroup } from "react-resizable-panels";
import ResizeHandle from "~/components/ResizePanel/ResizeHandler";
import { CodeSnippets } from "~/pageComponents/main/PageBottomPane/Components/CodeSnippets/CodeSnippets";
import {
	BottomPanel,
	BoundResizePanel,
} from "~/pageComponents/main/PageBottomPane/Components/side-components";
import { inferVisibilities } from "~/pageComponents/main/PageBottomPane/utils/infer-visibilites";
import { ResizablePanelsIndices } from "~/pageComponents/main/PageBottomPane/utils/types";
import { useBottomPanel } from "./hooks/useBottomPanel";

const PageBottomPane = ({
	panels,
	panelRefs,
	beforePanel,
	afterPanel,
	outputPanel,
}: ReturnType<typeof useBottomPanel>) => {
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
				<ResizeHandle direction="vertical" />
				<BoundResizePanel
					defaultSize={50}
					minSize={20}
					panelRefs={panelRefs}
					panelRefIndex={ResizablePanelsIndices.SNIPPETS_SECTION}
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
