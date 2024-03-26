import { useEffect } from "react";
import {
	PanelsRefs,
	ResizablePanelsIndices,
} from "~/pageComponents/main/PageBottomPane/utils/types";

export const useShowHide = ({
	isAfterPanelVisible,
	panelRefs,
}: {
	isAfterPanelVisible: boolean;
	panelRefs: PanelsRefs;
}) => {
	useEffect(() => {
		if (isAfterPanelVisible) {
			[
				ResizablePanelsIndices.BEFORE_SNIPPET,
				ResizablePanelsIndices.AFTER_AST,
				ResizablePanelsIndices.OUTPUT_AST,
			].map((panelIndex) => panelRefs.current[panelIndex]?.resize(33));
		} else {
			panelRefs.current[ResizablePanelsIndices.BEFORE_SNIPPET]?.resize(50);
			panelRefs.current[ResizablePanelsIndices.OUTPUT_AST]?.collapse();
			panelRefs.current[ResizablePanelsIndices.AFTER_AST]?.collapse();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAfterPanelVisible]);
};
