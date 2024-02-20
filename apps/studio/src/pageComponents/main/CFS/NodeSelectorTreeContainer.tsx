import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectFirstTreeNode } from "~/store/slices/snippets";
import {
	type TreeNodeSelectorState,
	getAvailableState,
	selectCFS,
	setNodeState,
} from "../../../store/slices/CFS";
import { type TreeNode } from "../../../types/tree";
import NodeSelectorTree from "./NodeSelectorTree";

const NodeSelectorTreeContainer = () => {
	const { nodeSelectorTreeState } = useSelector(selectCFS);

	const firstRange = useSelector(selectFirstTreeNode("before"));

	const dispatch = useDispatch();

	const updateNodeState = useCallback(
		(node: TreeNode, state: TreeNodeSelectorState) => {
			dispatch(setNodeState({ node, state }));
		},
		[dispatch],
	);

	const getNodeAvailableState = useCallback(
		(node: TreeNode) => {
			if (!firstRange) {
				return [];
			}

			return getAvailableState(node, firstRange);
		},
		[firstRange],
	);

	if (!firstRange) {
		return null;
	}

	return (
		<div className="mx-2 overflow-y-auto pb-2">
			<NodeSelectorTree
				getNodeAvailableState={getNodeAvailableState}
				node={firstRange}
				onClick={updateNodeState}
				state={nodeSelectorTreeState}
			/>
		</div>
	);
};

export default NodeSelectorTreeContainer;
