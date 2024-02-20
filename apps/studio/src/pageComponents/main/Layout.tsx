import { forwardRef, type FC, type ReactNode } from "react";
import {
	Panel,
	PanelGroup,
	type ImperativePanelHandle,
	type PanelProps,
} from "react-resizable-panels";

type Props = {
	children?: ReactNode;
};

const Layout = ({ children }: Props) => (
	<div className="flex h-[100vh] w-[100vw] flex-col overflow-hidden bg-gray-lighter dark:bg-gray-darker">
		{children}
	</div>
);

Layout.Content = (({ children, gap }) => (
	<PanelGroup
		autoSaveId="Top-Layout"
		className={`grid grow overflow-hidden lg:grid-cols-3 ${
			gap ?? "gap-6"
		}  p-2 pt-0`}
		direction="horizontal"
	>
		{children}
	</PanelGroup>
)) as FC<Props & { gap?: string }>;
Layout.Content.displayName = "LayoutContent";

Layout.Header = (({ children }) => (
	<div className="flex h-[80px] w-full bg-gray-lighter p-2 dark:bg-gray-darker">
		{children}
	</div>
)) as FC<Props>;
Layout.Header.displayName = "LayoutHeader";

const Column = ({ children }: Props) => (
	<Panel
		className="flex h-full flex-col gap-2 overflow-hidden dark:bg-gray-dark"
		collapsible
		defaultSize={33}
		minSize={15}
	>
		{children}
	</Panel>
);

Layout.Pane = (({ children }) => (
	<div className="relative h-1/2 min-h-0 rounded bg-gray-bg p-4 dark:bg-gray-light">
		{children}
	</div>
)) as FC<Props>;
Layout.Pane.displayName = "LayoutPane";

Layout.PaneItemVertical = (({ children }) => (
	<Panel
		className="relative h-1/2 min-h-0 rounded bg-gray-bg dark:bg-gray-light"
		collapsible
		defaultSize={50}
		minSize={15}
	>
		<div className="flex h-full w-full flex-col p-2 ">{children}</div>
	</Panel>
)) as FC<Props>;
Layout.PaneItemVertical.displayName = "LayoutPane";

Layout.Column = Column;
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
			<Panel
				{...rest}
				className={` min-h-0 ${className ?? ""} `}
				collapsible={collapsible}
				defaultSize={defaultSize}
				minSize={minSize}
				ref={ref}
			>
				<div className="flex h-full w-full flex-col ">{children}</div>
			</Panel>
		);
	},
);
ResizablePanel.displayName = "ResizablePanel";
Layout.Column = Column;
Layout.ResizablePanel = ResizablePanel;

export default Layout;
