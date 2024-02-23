import { type Node } from "@babel/types";
import { memo, useEffect, useState } from "react";
import TreeView from "react-treeview";
import Text from "../Text";

type Props = {
	node: TreeNode;
	onClick(node: TreeNode): void;
	selectedNode?: TreeNode;
	selectionStart?: number;
	selectionEnd?: number;
};

type TreeNode = {
	id: string;
	actualNode: Node;
	label: string;
	children?: TreeNode[];
	start: number;
	end: number;
};

const Tree = ({
	node,
	selectedNode,
	selectionStart = 0,
	selectionEnd = 0,
	onClick,
}: Props) => {
	const [open, setIsOpen] = useState(false);

	const containsSelectedNode =
		!!selectedNode &&
		node.start <= selectedNode.start &&
		node.end >= selectedNode.end;

	useEffect(() => {
		setIsOpen(containsSelectedNode);
	}, [containsSelectedNode]);

	const isSelected = selectedNode?.id === node.id;
	const label = (
		<Text
			className="cursor-pointer"
			color={isSelected ? "text-cyan-500" : undefined}
			id={`${node.label}-${node.start}-${node.end}`}
			onClick={() => {
				setIsOpen(!open);
				onClick(node);
			}}
		>
			{node.label}
		</Text>
	);

	if (!node.children?.length) {
		return label;
	}

	return (
		<TreeView collapsed={!open} nodeLabel={label}>
			{open
				? node.children.map((child, index) => (
						<Tree
							key={index}
							node={child}
							onClick={onClick}
							selectedNode={selectedNode}
							selectionEnd={selectionEnd}
							selectionStart={selectionStart}
						/>
				  ))
				: null}
		</TreeView>
	);
};

export default memo(Tree);
export type { TreeNode };
