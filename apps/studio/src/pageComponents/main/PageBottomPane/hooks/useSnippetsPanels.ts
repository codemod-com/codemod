import { useEffect } from "react";
import { useToggleVisibility } from "~/hooks/useToggleVisibility";
import { useCodeDiff } from "~/pageComponents/main/JSCodeshiftRender";
import { PanelsRefs, panelsData } from "~/pageComponents/main/PageBottomPane";
import { WarningTexts } from "~/pageComponents/main/PageBottomPane/Components/WarningTexts";
import { inferVisibilities } from "~/pageComponents/main/PageBottomPane/utils/inferVisibilites";

export const useSnippetsPanels = ({ panelRefs }: { panelRefs: PanelsRefs }) => {
	const { beforePanel, afterPanel, outputPanel } = panelsData;
	const codeDiff = useCodeDiff();
	const warnings = WarningTexts(codeDiff);
	const afterWithMessages = {
		...afterPanel,
		visibilityOptions: useToggleVisibility(),
		snippetData: {
			...afterPanel.snippetData,
			warnings,
		},
	};
	const { onlyAfterHidden } = inferVisibilities({
		beforePanel,
		afterPanel: afterWithMessages,
		outputPanel,
	});

	useEffect(() => {
		if (onlyAfterHidden) {
			panelRefs.current[afterPanel.snippedIndex]?.collapse();
		}
	}, [onlyAfterHidden]);

	return {
		beforePanel,
		afterPanel: afterWithMessages,
		outputPanel,
		codeDiff,
		onlyAfterHidden,
	};
};
