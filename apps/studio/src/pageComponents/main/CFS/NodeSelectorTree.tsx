import { memo } from "react";
import TreeView from "react-treeview";
import IconButton from "../../../components/IconButton";
import Text from "../../../components/Text";
import { states, type TreeNodeSelectorState } from "../../../store/slices/CFS";
import { type TreeNode } from "../../../types/tree";

type Props = Readonly<{
	node: TreeNode;
	onClick(node: TreeNode, state: TreeNodeSelectorState): void;
	getNodeAvailableState(node: TreeNode): TreeNodeSelectorState[];
	state: Record<string, TreeNodeSelectorState>;
}>;

const TOOLTIPS = {
	Type: "Match only the type of this node",
	Value: "Match the type and the value of this node",
	Unselected: "Do not match this node",
};

const NodeSelectorTree = ({
	node,
	state,
	onClick,
	getNodeAvailableState,
}: Props) => {
	const availableStates = getNodeAvailableState(node);

	const label = (
		<div className="align-center mt-2 flex">
			<div className="mr-2">
				{availableStates.length > 1
					? availableStates.map((s, i) => (
							<IconButton
								key={`${node.id}-${s}-${i}`}
								isActive={s === state[node.id]}
								onClick={() => onClick(node, s)}
								tooltip={TOOLTIPS[s]}
							>
								{s.slice(0, 1)}
							</IconButton>
					  ))
					: null}
			</div>
			<Text className="cursor-pointer" id={node.id}>
				{node.label}
			</Text>
		</div>
	);

	if (!node.children?.length) {
		return label;
	}

	return (
		<div className="node-selector-tree">
			<TreeView collapsed={false} nodeLabel={label}>
				{state[node.id] !== states.UNSELECTED
					? node.children.map((child, index) => (
							<NodeSelectorTree
								getNodeAvailableState={getNodeAvailableState}
								key={index}
								node={child}
								onClick={onClick}
								state={state}
							/>
					  ))
					: null}
			</TreeView>
		</div>
	);
};

export default memo(NodeSelectorTree);
