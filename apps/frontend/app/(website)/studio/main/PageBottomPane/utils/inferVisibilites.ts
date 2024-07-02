import type { BottomPanelData } from "@studio/main/PageBottomPane/utils/types";
import { isVisible } from "@studio/utils/visibility";

export const inferVisibilities = ({
  beforePanel,
  afterPanel,
  outputPanel,
}: BottomPanelData) => ({
  onlyAfterHidden:
    !isVisible(afterPanel) && isVisible(beforePanel) && isVisible(outputPanel),
  onlyBeforeHidden:
    isVisible(afterPanel) && !isVisible(beforePanel) && isVisible(outputPanel),
  afterAndBeforeHidden:
    !isVisible(afterPanel) && !isVisible(beforePanel) && isVisible(outputPanel),
});
