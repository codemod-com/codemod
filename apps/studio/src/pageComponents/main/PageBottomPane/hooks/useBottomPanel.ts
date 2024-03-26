import { usePanels } from "~/pageComponents/main/PageBottomPane/hooks/usePanels";
import { useShowHide } from "~/pageComponents/main/PageBottomPane/hooks/useShowHide";
import { PanelsRefs } from "~/pageComponents/main/PageBottomPane/utils/types";
import { isVisible } from "~/utils/visibility";

export const useBottomPanel = (panelRefs: PanelsRefs) => {
	const { beforePanel, afterPanel, outputPanel, panels } = usePanels();

	useShowHide({ isAfterPanelVisible: isVisible(afterPanel), panelRefs });

	return {
		panels,
		panelRefs,
		beforePanel,
		afterPanel,
		outputPanel,
	};
};
