import { PropsWithChildren, type ReactNode } from "react";
import Text from "~/components/Text";
import { cn } from "~/lib/utils";

type PanelHeaderProps = PropsWithChildren<{
	className?: string;
}>;

const PanelHeader = ({ children, className }: PanelHeaderProps) => (
	<div className={cn("panel_panel_header h-[2.5rem]", className)}>
		{children}
	</div>
);

type PanelTabProps = {
	children: ReactNode;
	className?: string;
	active?: boolean;
	inactive?: boolean;
	onClick?: () => void;
	ondblclick?: () => void;
	borderBottom?: boolean;
};
const PanelTab = ({
	children,
	className,
	active,
	inactive,
	ondblclick,
	borderBottom = true,
	onClick: onTabClick,
}: PanelTabProps) => {
	const classNames = cn(
		"panel_panel_tab",
		borderBottom && "border-b",
		inactive && "panel_panel_tab_inactive",
		active && "panel_panel_tab_active",
		(ondblclick || onTabClick) && "panel_panel_tab_clicked",
		className,
	);
	return (
		<div className={classNames} onClick={onTabClick} onDoubleClick={ondblclick}>
			{children}
		</div>
	);
};

const PanelTitle = ({ children }: PanelHeaderProps) => (
	<Text className="panel_panel_title" isTitle size="lg">
		{children}
	</Text>
);

export { PanelTab, PanelHeader, PanelTitle };
