import cn from "classnames";
import { CSSProperties, ReactNode, useLayoutEffect, useRef } from "react";
import styles from "./style.module.css";

const getLabelComponent = (
	label: string,
	searchPhrase: string,
	style?: CSSProperties,
) => {
	if (
		searchPhrase.length >= 2 &&
		label.toLowerCase().includes(searchPhrase.toLowerCase())
	) {
		const startIndex = label.toLowerCase().indexOf(searchPhrase.toLowerCase());
		const endIndex = startIndex + searchPhrase.length - 1;
		return (
			<span className={styles.label} style={style}>
				{label.slice(0, startIndex)}
				<span style={{ fontWeight: 800 }}>
					{label.slice(startIndex, endIndex + 1)}
				</span>
				{label.slice(endIndex + 1)}
			</span>
		);
	}

	return (
		<span className={styles.label} style={style}>
			{label}
		</span>
	);
};

export type Props = Readonly<{
	id: string;
	label: string;
	open: boolean;
	focused: boolean;
	icon: ReactNode;
	hasChildren: boolean;
	onClick(event: React.MouseEvent<HTMLDivElement>): void;
	depth: number;
	indent: number;
	startDecorator?: ReactNode;
	endDecorator?: ReactNode;
	inlineStyles?: {
		root?: CSSProperties;
		icon?: CSSProperties;
		label?: CSSProperties;
		actions?: CSSProperties;
	};
	onPressChevron?(event: React.MouseEvent<HTMLSpanElement>): void;
	searchPhrase: string;
}>;

const TreeItem = ({
	id,
	label,
	icon,
	open,
	focused,
	startDecorator,
	hasChildren,
	onClick,
	indent,
	inlineStyles,
	onPressChevron,
	endDecorator,
	searchPhrase,
}: Props) => {
	const ref = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		if (focused) {
			const timeout = setTimeout(() => {
				ref.current?.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "center",
				});
			}, 0);

			return () => {
				clearTimeout(timeout);
			};
		}

		return () => {};
	}, [focused]);

	return (
		<div
			key={id}
			ref={ref}
			tabIndex={0}
			className={cn(styles.root, focused && styles.focused)}
			onClick={onClick}
			style={inlineStyles?.root}
		>
			<div
				style={{
					minWidth: `${indent}px`,
				}}
			/>
			{hasChildren ? (
				<span
					onClick={onPressChevron}
					className={cn("codicon", {
						"codicon-chevron-right": !open,
						"codicon-chevron-down": open,
					})}
				/>
			) : null}
			{startDecorator}
			{icon !== null && (
				<div className="defaultIcon" style={inlineStyles?.icon}>
					{icon}
				</div>
			)}
			{getLabelComponent(label, searchPhrase, inlineStyles?.label)}
			{endDecorator}
		</div>
	);
};

export default TreeItem;
