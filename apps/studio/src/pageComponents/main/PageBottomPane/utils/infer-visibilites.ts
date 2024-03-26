import { PanelData } from "~/pageComponents/main/PageBottomPane/utils/types";
import { Repeat } from "~/types/transformations";
import { isVisible } from "~/utils/visibility";

export const inferVisibilities = ([
	beforePanel,
	afterPanel,
	outputPanel,
]: Repeat<PanelData, 3>) => ({
	onlyAfterHidden:
		!isVisible(afterPanel) && isVisible(beforePanel) && isVisible(outputPanel),
	onlyBeforeHidden:
		isVisible(afterPanel) && !isVisible(beforePanel) && isVisible(outputPanel),
	afterAndBeforeHidden:
		!isVisible(afterPanel) && !isVisible(beforePanel) && isVisible(outputPanel),
});
