import { useToggleVisibility } from "@studio/hooks/useToggleVisibility";
import { useCodeDiff } from "@studio/main/JSCodeshiftRender";
import { type PanelsRefs, panelsData } from "@studio/main/PageBottomPane";
import { WarningTexts } from "@studio/main/PageBottomPane/Components/WarningTexts";
import { inferVisibilities } from "@studio/main/PageBottomPane/utils/inferVisibilites";
import { useEffect } from "react";

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
