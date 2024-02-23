import { type ReactNode } from "react";
import Text from "~/components/Text";
import { cn } from "~/lib/utils";

type PanelHeaderProps = {
	children: ReactNode;
};

const PanelHeader = ({ children }: PanelHeaderProps) => (
	<div className=" panel_panel_header h-[2.5rem]">{children}</div>
);

type PanelTabProps = {
	children: ReactNode;
	className?: string;
	active?: boolean;
	inactive?: boolean;
	onClick?: () => void;
	ondblclick?: () => void;
};
const PanelTab = ({
	children,
	className,
	active,
	inactive,
	ondblclick,
	onClick: onTabClick,
}: PanelTabProps) => {
	const classNames = cn(
		"panel_panel_tab",
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
