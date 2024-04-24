import cn from "classnames";
import { memo } from "react";
import type { _ExplorerNode } from "../../../src/persistedState/explorerNodeCodec";
import { ReactComponent as CheckboxMaterialIcon } from "../assets/material-icons/check_box.svg";
import { ReactComponent as CheckboxOutlineBlankMaterialIcon } from "../assets/material-icons/check_box_outline_blank.svg";
import { ReactComponent as IndeterminateCheckboxMaterialIcon } from "../assets/material-icons/indeterminate_check_box.svg";
import TreeItem, { type Props as TreeItemProps } from "../shared/TreeItem";
import styles from "./style.module.css";

type Props = Omit<
	TreeItemProps,
	"icon" | "startDecorator" | "inlineStyles" | "subLabel"
> & {
	kind: _ExplorerNode["kind"];
	iconName: IconName | null;
	checkboxState: "checked" | "blank" | "indeterminate";
	reviewed: boolean;
	onCheckboxClick(e: React.MouseEvent): void;
	searchPhrase: string;
};

export type IconName = "file-add" | "file";

const getIcon = (iconName: IconName | null) => {
	if (iconName !== "file-add" && iconName !== "file") {
		return null;
	}

	return <span className={cn("codicon", `codicon-${iconName}`)} />;
};

const getIndent = (kind: _ExplorerNode["kind"], depth: number) => {
	let offset = 17 * depth;

	if (kind === "FILE") {
		offset += 17;
	}

	return offset;
};

const Checkbox = memo(
	({
		checkboxState,
		onClick,
	}: {
		checkboxState: "checked" | "blank" | "indeterminate";
		onClick(e: React.MouseEvent): void;
	}) => {
		return (
			<span onClick={onClick} className={styles.checkbox}>
				{checkboxState === "checked" && (
					<CheckboxMaterialIcon fill="var(--vscode-icon-foreground)" />
				)}
				{checkboxState === "blank" && (
					<CheckboxOutlineBlankMaterialIcon fill="var(--vscode-icon-foreground)" />
				)}
				{checkboxState === "indeterminate" && (
					<IndeterminateCheckboxMaterialIcon fill="var(--vscode-icon-foreground)" />
				)}
			</span>
		);
	},
);

const FileExplorerTreeNode = ({
	hasChildren,
	id,
	label,
	depth,
	open,
	focused,
	reviewed,
	iconName,
	checkboxState,
	kind,
	onClick,
	onCheckboxClick,
	onPressChevron,
	searchPhrase,
}: Props) => {
	return (
		<TreeItem
			searchPhrase={searchPhrase}
			hasChildren={hasChildren}
			id={id}
			label={label}
			icon={getIcon(iconName)}
			indent={getIndent(kind, depth)}
			depth={depth}
			open={open}
			focused={focused}
			onClick={onClick}
			startDecorator={
				<Checkbox checkboxState={checkboxState} onClick={onCheckboxClick} />
			}
			onPressChevron={onPressChevron}
			inlineStyles={{
				root: {
					...(!focused && {
						backgroundColor: "var(--vscode-list-hoverBackground)",
					}),
					paddingRight: 4,
				},
			}}
			endDecorator={
				reviewed && <span className={cn("codicon", "codicon-eye")} />
			}
		/>
	);
};

export default memo(FileExplorerTreeNode);
