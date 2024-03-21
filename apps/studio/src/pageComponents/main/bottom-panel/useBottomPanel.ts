import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { collapseOnNextTick } from "~/pageComponents/main/bottom-panel/collapce-on-next-tick";
import { Panel } from "~/pageComponents/main/bottom-panel/types";
import { usePanels } from "~/pageComponents/main/bottom-panel/usePanels";
import { useShowHide } from "~/pageComponents/main/bottom-panel/useShowHide";
import { selectEngine } from "~/store/slices/snippets";
import { selectASTViewCollapsed, viewSlice } from "~/store/slices/view";
import { isVisible } from "~/utils/visibility";

export const useBottomPanel = () => {
	const engine = useSelector(selectEngine);
	const astViewCollapsed = useSelector(selectASTViewCollapsed);

	const dispatch = useDispatch();
	const panelRefs = useRef<Record<string, ImperativePanelHandle | null>>({});

	const togglePanel = () => {
		dispatch(viewSlice.actions.setASTViewCollapsed(!astViewCollapsed));
	};

	const { beforePanel, afterPanel, outputPanel } = usePanels();

	useShowHide({ isAfterPanelVisible: isVisible(afterPanel), panelRefs });

	useEffect(() => {
		const panel = panelRefs.current[Panel.AST_SECTION];

		return collapseOnNextTick({
			panel,
			size: 25,
			isCollapsed: astViewCollapsed,
		});
	}, [astViewCollapsed]);

	return {
		panelRefs,
		engine,
		astViewCollapsed,
		dispatch,
		togglePanel,
		beforePanel,
		afterPanel,
		outputPanel,
	};
};
