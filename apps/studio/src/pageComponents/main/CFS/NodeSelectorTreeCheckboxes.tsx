import { type Node, isIdentifier, isStringLiteral } from "@babel/types";
import { memo } from "react";
import TreeView from "react-treeview";
import { cn } from "~/lib/utils";
import Checkbox from "../../../components/CheckBox";
import Text from "../../../components/Text";
import { type TreeNodeSelectorState, states } from "../../../store/slices/CFS";
import { type TreeNode } from "../../../types/tree";

type Props = Readonly<{
	node: TreeNode;
	getNodeAvailableState(node: TreeNode): TreeNodeSelectorState[];
	onCheckboxClick(node: TreeNode): void;
	onLabelClick(node: TreeNode): void;
	onMouseEnter(node: TreeNode): void;
	state: Record<string, TreeNodeSelectorState>;
}>;

const TOOLTIPS = {
	Type: "Match only the type of this node",
	Value: "Match the type and the value of this node",
	Unselected: "Do not match this node",
};

const getNodeValue = (node: Node): string => {
	if (isIdentifier(node)) {
		return node.name;
	}

	if (isStringLiteral(node)) {
		return node.value;
	}

	if (node.type === "NumberLiteral") {
		return String(node.value);
	}

	return "";
};

const getFormattedNodeName = (
	node: TreeNode,
	nodeState: TreeNodeSelectorState,
	// eslint-disable-next-line consistent-return
): string => {
	// eslint-disable-next-line default-case
	switch (nodeState) {
		case states.TYPE:
			return node.label;
		case states.VALUE:
			return `${node.label} "${getNodeValue(node.actualNode)}"`;
		case states.UNSELECTED:
			return "Anything";
	}
};

const NodeSelectorTree = ({
	node,
	state,
	onCheckboxClick,
	onLabelClick,
	getNodeAvailableState,
	onMouseEnter,
}: Props) => {
	const nodeState = state[node.id];

	const availableStates = getNodeAvailableState(node);

	const isCheckboxVisible = [states.TYPE, states.UNSELECTED].every((s) =>
		availableStates.includes(s),
	);

	const isTextClickable = [states.TYPE, states.VALUE].every((s) =>
		availableStates.includes(s),
	);

	const label = (
		<div
			className="tree-view_label mt-2 flex h-[24px] w-full items-center"
			onMouseEnter={() => {
				onMouseEnter(node);
			}}
		>
			<div
				data-tooltip-content={nodeState && TOOLTIPS[nodeState]}
				data-tooltip-id="button-tooltip"
			>
				{isCheckboxVisible ? (
					<Checkbox
						checked={nodeState !== states.UNSELECTED}
						key={node.id}
						label=""
						onChange={() => onCheckboxClick(node)}
					/>
				) : null}
			</div>
			<div
				data-tooltip-content={nodeState && TOOLTIPS[nodeState]}
				data-tooltip-id="button-tooltip"
			>
				<Text
					className={cn(
						isTextClickable && "cursor-pointer",
						!isTextClickable && "opacity-50",
					)}
					id={node.id}
					onClick={() => {
						if (!isTextClickable) {
							return;
						}

						onLabelClick(node);
					}}
				>
					{nodeState && getFormattedNodeName(node, nodeState)}
				</Text>
			</div>
		</div>
	);

	if (!node.children?.length) {
		return label;
	}

	return (
		<div className="node-selector-tree">
			<TreeView collapsed={false} nodeLabel={label}>
				{nodeState !== states.UNSELECTED
					? node.children.map((child, index) => (
							<NodeSelectorTree
								getNodeAvailableState={getNodeAvailableState}
								key={index}
								node={child}
								onCheckboxClick={onCheckboxClick}
								onLabelClick={onLabelClick}
								onMouseEnter={onMouseEnter}
								state={state}
							/>
					  ))
					: null}
			</TreeView>
		</div>
	);
};

export default memo(NodeSelectorTree);
