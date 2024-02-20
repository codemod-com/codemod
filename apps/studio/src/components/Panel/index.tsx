import { forwardRef, type ReactNode } from "react";
import {
	Panel as RResizablePanel,
	type ImperativePanelHandle,
	type PanelProps,
} from "react-resizable-panels";
import { cn } from "~/lib/utils";
import { PanelHeader, PanelTab, PanelTitle } from "./PanelHeader";

type Props = {
	children?: ReactNode;
	className?: string;
};

const Panel = ({ children, className }: Props) => (
	<div
		className={cn("rounded bg-gray-lighter p-2 dark:bg-gray-dark", className)}
	>
		<div className="h-full rounded bg-gray-bg dark:bg-gray-light">
			{children}
		</div>
	</div>
);

type ResizablePanelProps = {
	children?: ReactNode;
	defaultSize: number;
	minSize: number;
	collapsible?: boolean;
	className?: string;
} & PanelProps;

const ResizablePanel = forwardRef<ImperativePanelHandle, ResizablePanelProps>(
	(props, ref) => {
		const { children, defaultSize, minSize, collapsible, className, ...rest } =
			props;
		return (
			<RResizablePanel
				{...rest}
				className={` min-h-0 rounded ${className ?? ""} `}
				collapsible={collapsible}
				defaultSize={defaultSize}
				minSize={minSize}
				ref={ref}
			>
				<div className="flex w-full flex-col">{children}</div>
			</RResizablePanel>
		);
	},
);
ResizablePanel.displayName = "ResizablePanel";

Panel.Header = PanelHeader;
Panel.HeaderTab = PanelTab;
Panel.HeaderTitle = PanelTitle;
Panel.ResizablePanel = ResizablePanel;

export default Panel;
