import { forwardRef, ReactNode, useEffect, useRef } from "react";
import {
	ImperativePanelHandle,
	PanelGroupProps,
	PanelProps,
	Panel as RResizablePanel,
	PanelGroup as RResizablePanelGroup,
} from "react-resizable-panels";

type ResizablePanelProps = {
	children?: ReactNode;
	defaultSize: number;
	minSize: number;
	collapsible?: boolean;
	className?: string;
} & PanelProps;

const PanelGroup = (props: PanelGroupProps) => {
	const isResizingRef = useRef(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const onStartResizing = (e: MouseEvent) => {
			if (
				(e.target as HTMLDivElement | null)?.getAttribute(
					"data-panel-resize-handle-id",
				) === undefined
			) {
				return;
			}

			isResizingRef.current = true;
		};

		const onEndResizing = () => {
			isResizingRef.current = false;
		};

		const onResize = (e: MouseEvent) => {
			if (isResizingRef.current === false) {
				e.stopPropagation();
			}
		};

		if (containerRef.current === null) {
			return;
		}

		containerRef.current.addEventListener("mousedown", onStartResizing);

		containerRef.current.addEventListener("mouseup", onEndResizing);
		containerRef.current.addEventListener("contextmenu", onEndResizing);

		containerRef.current.addEventListener("mousemove", onResize);

		return () => {
			if (containerRef.current === null) {
				return;
			}

			containerRef.current.removeEventListener("mousedown", onStartResizing);

			containerRef.current.removeEventListener("mouseup", onEndResizing);
			containerRef.current.removeEventListener("contextmenu", onEndResizing);

			// eslint-disable-next-line react-hooks/exhaustive-deps
			containerRef.current.removeEventListener("mousemove", onResize);
		};
	}, []);

	return (
		<div ref={containerRef} className="w-full h-full">
			<RResizablePanelGroup {...props}>{props.children}</RResizablePanelGroup>
		</div>
	);
};

const ResizablePanel = forwardRef<ImperativePanelHandle, ResizablePanelProps>(
	(props, ref) => {
		const { children, defaultSize, minSize, collapsible, className, ...rest } =
			props;
		return (
			<RResizablePanel
				{...rest}
				className={className}
				collapsible={collapsible}
				defaultSize={defaultSize}
				minSize={minSize}
				ref={ref}
			>
				<div className="w-full h-full">{children}</div>
			</RResizablePanel>
		);
	},
);

export { ResizablePanel, PanelGroup };
