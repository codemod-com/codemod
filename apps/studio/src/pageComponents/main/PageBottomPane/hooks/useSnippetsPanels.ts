import { useEffect } from "react";
import { useToggleVisibility } from "~/hooks/useToggleVisibility";
import { useCodeDiff } from "~/pageComponents/main/JSCodeshiftRender";
import {
	PanelData,
	PanelsRefs,
	panelsData,
} from "~/pageComponents/main/PageBottomPane";
import { WarningTexts } from "~/pageComponents/main/PageBottomPane/Components/WarningTexts";
import { inferVisibilities } from "~/pageComponents/main/PageBottomPane/utils/infer-visibilites";

const useAddVisibleOptions = (panel: PanelData) => {
	return {
		...panel,
		visibilityOptions: useToggleVisibility(),
	};
};
export const useSnippetsPanels = ({ panelRefs }: { panelRefs: PanelsRefs }) => {
	const { beforePanel, afterPanel, outputPanel } = panelsData;
	const codeDiff = useCodeDiff();
	const warnings = WarningTexts(codeDiff);
	const afterWithMessages = {
		...afterPanel,
		snippetData: {
			...afterPanel.snippetData,
			warnings,
		},
	};
	const afterPanelWithVisibilityOptions =
		useAddVisibleOptions(afterWithMessages);
	const { onlyAfterHidden } = inferVisibilities({
		beforePanel,
		afterPanel: afterPanelWithVisibilityOptions,
		outputPanel,
	});

	useEffect(() => {
		if (onlyAfterHidden) {
			panelRefs.current[afterPanel.snippedIndex]?.collapse();
		}
	}, [onlyAfterHidden]);

	return {
		beforePanel,
		afterPanel: afterPanelWithVisibilityOptions,
		outputPanel,
		codeDiff,
		onlyAfterHidden,
	};
};
