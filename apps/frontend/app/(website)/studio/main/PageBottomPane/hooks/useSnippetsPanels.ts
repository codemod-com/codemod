import { useToggleVisibility } from "@studio/hooks/useToggleVisibility";
import { useCodeDiff } from "@studio/main/JSCodeshiftRender";
import { type PanelsRefs, panelsData } from "@studio/main/PageBottomPane";
import { WarningTexts } from "@studio/main/PageBottomPane/Components/WarningTexts";
import { inferVisibilities } from "@studio/main/PageBottomPane/utils/inferVisibilites";
import { useEffect } from "react";

export let useSnippetsPanels = ({ panelRefs }: { panelRefs: PanelsRefs }) => {
  let { beforePanel, afterPanel, outputPanel } = panelsData;
  let codeDiff = useCodeDiff();
  let warnings = WarningTexts(codeDiff);
  let afterWithMessages = {
    ...afterPanel,
    visibilityOptions: useToggleVisibility(),
    snippetData: {
      ...afterPanel.snippetData,
      warnings,
    },
  };
  let { onlyAfterHidden } = inferVisibilities({
    beforePanel,
    afterPanel: afterWithMessages,
    outputPanel,
  });

  useEffect(() => {
    if (onlyAfterHidden) {
      panelRefs.current[afterPanel.snippedIndex]?.collapse();
    }
  }, [
    onlyAfterHidden,
    afterPanel.snippedIndex,
    panelRefs.current[afterPanel.snippedIndex]?.collapse,
  ]);

  return {
    beforePanel,
    afterPanel: afterWithMessages,
    outputPanel,
    codeDiff,
    onlyAfterHidden,
  };
};
