import classNames from "classnames";
import { cx } from "cva";

type ExtraExtension = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const GradientBorderBox = ({
	children,
	sides,
	dots,
	extend,
	className,
	sidesClassNames,
}: {
	children: React.ReactNode;
	className?: string;
	sidesClassNames?: {
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	};
	sides?: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
	dots?: { tr?: boolean; br?: boolean; bl?: boolean; tl?: boolean };
	extend?: {
		orientation: "horizontal" | "vertical";
		corners: { tr: boolean; br: boolean; bl: boolean; tl: boolean };
		extraExtension?: ExtraExtension[];
	};
}) => {
	const sidesDefaults = { top: true, right: true, bottom: true, left: true };
	const dotsDefaults = { tr: true, br: true, bl: true, tl: true };
	const dotsToRender = { ...dotsDefaults, ...dots };
	const sidesToRender = { ...sidesDefaults, ...sides };
	const extendDefaults = {
		orientation: "horizontal",
		corners: { tr: false, br: false, bl: false, tl: false },
	};
	const extendToRender = { ...extendDefaults, ...extend };
	return (
		<div className={classNames("relative max-w-fit", className)}>
			{extendToRender.corners.br && (
				<div
					className={classNames(
						"extend absolute right-0 top-full w-px origin-top  bg-gradient-to-b from-[#0b151e39] dark:from-[#ffffff34]",
						extendToRender.extraExtension?.includes("bottom-right")
							? "h-full"
							: "h-1/6",
						{
							"-rotate-90": extendToRender.orientation === "horizontal",
						},
					)}
				/>
			)}
			{extendToRender.corners.tr && (
				<div
					className={classNames(
						"extend absolute bottom-full right-0 w-px origin-bottom  bg-gradient-to-t from-[#0b151e39] dark:from-[#ffffff34]",
						extendToRender.extraExtension?.includes("top-right")
							? "h-full"
							: "h-1/6",
						{
							"rotate-90": extendToRender.orientation === "horizontal",
						},
					)}
				/>
			)}
			{extendToRender.corners.tl && (
				<div
					className={classNames(
						"extend absolute bottom-full left-0 w-px origin-bottom  bg-gradient-to-t from-[#0b151e39] dark:from-[#ffffff34]",
						extendToRender.extraExtension?.includes("top-left")
							? "h-full"
							: "h-1/6",
						{
							"-rotate-90": extendToRender.orientation === "horizontal",
						},
					)}
				/>
			)}
			{extendToRender.corners.bl && (
				<div
					className={classNames(
						"extend absolute left-0 top-full w-px origin-top  bg-gradient-to-b from-[#0b151e39] dark:from-[#ffffff34]",
						extendToRender.extraExtension?.includes("bottom-left")
							? "h-full"
							: "h-1/6",
						{
							"rotate-90": extendToRender.orientation === "horizontal",
						},
					)}
				/>
			)}
			{dotsToRender.tr && (
				<svg className="dot absolute -right-[2px] -top-[2px] z-20 max-h-[5px] min-h-[5px] min-w-[5px] max-w-[5px] rounded-full bg-background-dark dark:bg-white" />
			)}
			{dotsToRender.br && (
				<svg className="dot absolute -bottom-[2px] -right-[2px] z-20 max-h-[5px] min-h-[5px] min-w-[5px] max-w-[5px] rounded-full bg-background-dark dark:bg-white" />
			)}
			{dotsToRender.bl && (
				<svg className="dot absolute -bottom-[2px] -left-[2px] z-20 max-h-[5px] min-h-[5px] min-w-[5px] max-w-[5px] rounded-full bg-background-dark dark:bg-white" />
			)}
			{dotsToRender.tl && (
				<svg className="dot absolute -left-[2px] -top-[2px] z-20 max-h-[5px] min-h-[5px] min-w-[5px] max-w-[5px] rounded-full bg-background-dark dark:bg-white" />
			)}

			<div
				className={cx(
					" absolute left-0 top-0 z-20 h-px w-full bg-gradient-to-r from-transparent via-[#0b151e39] dark:via-[#ffffff34]",
					{
						hidden: !sidesToRender.top,
					},
					sidesClassNames?.top,
				)}
			/>

			<div
				className={cx(
					"absolute right-0 top-0 z-20 h-full w-px bg-gradient-to-t from-transparent via-[#0b151e39] dark:bg-[#ffffff34]",
					{
						hidden: !sidesToRender.right,
					},
					sidesClassNames?.right,
				)}
			/>

			<div
				className={cx(
					"absolute bottom-0 left-0 z-20 h-px w-full  bg-gradient-to-r from-transparent via-[#0b151e39] dark:via-[#ffffff34]",
					{
						hidden: !sidesToRender.bottom,
					},
					sidesClassNames?.bottom,
				)}
			/>

			<div
				className={cx(
					"absolute left-0 top-0 z-20 h-full w-px  bg-gradient-to-t from-transparent via-[#0b151e39] dark:bg-[#ffffff34]",
					{
						hidden: !sidesToRender.left,
					},
					sidesClassNames?.left,
				)}
			/>

			{children}
		</div>
	);
};

export default GradientBorderBox;
