import { PropsWithChildren, Suspense } from "react";
import { PanelGroup } from "react-resizable-panels";
import {
	BottomPanel,
	BoundResizePanel,
} from "~/pageComponents/main/PageBottomPane/Components/side-components";
import {
	PanelsRefs,
	ResizablePanelsIndices,
} from "~/pageComponents/main/PageBottomPane/utils/types";

const PageBottomPane = ({
	children,
	panelRefs,
}: PropsWithChildren<{ panelRefs: PanelsRefs }>) => {
	return (
		<BottomPanel>
			<Suspense>
				<BoundResizePanel
					minSize={20}
					panelRefs={panelRefs}
					panelRefIndex={ResizablePanelsIndices.SNIPPETS_SECTION}
				>
					<PanelGroup direction="horizontal">{children}</PanelGroup>
				</BoundResizePanel>
			</Suspense>
		</BottomPanel>
	);
};

export default PageBottomPane;
