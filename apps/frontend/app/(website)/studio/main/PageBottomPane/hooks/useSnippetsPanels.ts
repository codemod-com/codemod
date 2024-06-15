import { useCodeDiff } from "@studio/hooks/useCodeDiff";
import { useToggleVisibility } from "@studio/hooks/useToggleVisibility";
import { type PanelsRefs, panelsData } from "@studio/main/PageBottomPane";
import { WarningTexts } from "@studio/main/PageBottomPane/Components/WarningTexts";
import { inferVisibilities } from "@studio/main/PageBottomPane/utils/inferVisibilites";
import { mergeDeepRight } from "ramda";
import { useEffect } from "react";

export let useSnippetsPanels = ({ panelRefs }: { panelRefs: PanelsRefs }) => {
  let { beforePanel, afterPanel, outputPanel } = panelsData;
  let codeDiff = useCodeDiff();
  let warnings = WarningTexts(codeDiff);
  let afterWithVisibilityOptions = {
    ...afterPanel,
    visibilityOptions: useToggleVisibility(),
  };
  let outputWithMessages = mergeDeepRight(outputPanel, {
    snippetData: { warnings },
  });
  let { onlyAfterHidden } = inferVisibilities({
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
