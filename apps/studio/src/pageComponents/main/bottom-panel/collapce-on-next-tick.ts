import type { ImperativePanelHandle } from "react-resizable-panels";
import { isNil } from "~/utils/isNil";

export const collapseOnNextTick = ({
	panel,
	size,
	isCollapsed,
}: {
	panel: ImperativePanelHandle | null | undefined;
	isCollapsed: boolean;
	size: number;
}) => {
	if (isNil(panel)) return;

	if (isCollapsed) {
		queueMicrotask(() => panel?.collapse?.());
	}

	panel.resize(size);
};
