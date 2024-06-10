import { useCodeDiff } from "@studio/hooks/useCodeDiff";
import { useToggleVisibility } from "@studio/hooks/useToggleVisibility";
import { type PanelsRefs, panelsData } from "@studio/main/PageBottomPane";
import { WarningTexts } from "@studio/main/PageBottomPane/Components/WarningTexts";
import { inferVisibilities } from "@studio/main/PageBottomPane/utils/inferVisibilites";
import { mergeDeepRight } from "ramda";
import { useEffect } from "react";

export const useSnippetsPanels = ({ panelRefs }: { panelRefs: PanelsRefs }) => {
  const { beforePanel, afterPanel, outputPanel } = panelsData;
  const codeDiff = useCodeDiff();
  const warnings = WarningTexts(codeDiff);
  const afterWithVisibilityOptions = {
    ...afterPanel,
    visibilityOptions: useToggleVisibility(),
  };
  const outputWithMessages = mergeDeepRight(outputPanel, {
    snippetData: { warnings },
  });
  const { onlyAfterHidden } = inferVisibilities({
    beforePanel,
    afterPanel: afterWithVisibilityOptions,
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
    afterPanel: afterWithVisibilityOptions,
    outputPanel: outputWithMessages,
    codeDiff,
    onlyAfterHidden,
  };
};
