import { useEffect } from "react";
import { Panel, PanelsRefs } from "~/pageComponents/main/bottom-panel/types";

export const useShowHide = ({
	isAfterPanelVisible,
	panelRefs,
}: {
	isAfterPanelVisible: boolean;
	panelRefs: PanelsRefs;
}) => {
	useEffect(() => {
		if (isAfterPanelVisible) {
			[Panel.BEFORE_SNIPPET, Panel.AFTER_AST, Panel.OUTPUT_AST].map(
				(panelIndex) => panelRefs.current[panelIndex]?.resize(33),
			);
		} else {
			panelRefs.current[Panel.BEFORE_SNIPPET]?.resize(50);
			panelRefs.current[Panel.OUTPUT_AST]?.collapse();
			panelRefs.current[Panel.AFTER_AST]?.collapse();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAfterPanelVisible]);
};
