import { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectFirstTreeNode } from '~/store/slices/snippets';
import {
	getAvailableState,
	selectCFS,
	setHoveredNode,
	setNodeState,
	states,
} from '../../../store/slices/CFS';
import { type TreeNode } from '../../../types/tree';
import NodeSelectorTree from './NodeSelectorTreeCheckboxes';

const NodeSelectorTreeContainer = () => {
	const { nodeSelectorTreeState } = useSelector(selectCFS);

	const firstTreeNode = useSelector(selectFirstTreeNode('before'));

	const dispatch = useDispatch();

	const getNodeAvailableState = useCallback(
		(node: TreeNode) => {
			if (firstTreeNode === null) {
				return [];
			}

			return getAvailableState(node, firstTreeNode);
		},
		[firstTreeNode],
	);

	if (!firstTreeNode) {
		return null;
	}

	const onCheckboxClick = (node: TreeNode) => {
		const isUnselected =
			nodeSelectorTreeState[node.id] === states.UNSELECTED;

		dispatch(
			setNodeState({
				node,
				state: isUnselected ? states.TYPE : states.UNSELECTED,
			}),
		);
	};

	const onLabelClick = (node: TreeNode) => {
		const isType = nodeSelectorTreeState[node.id] === states.TYPE;
		dispatch(
			setNodeState({
				node,
				state: isType ? states.VALUE : states.TYPE,
			}),
		);
	};

	const onMouseEnter = (node: TreeNode) => {
		dispatch(setHoveredNode(node));
	};

	return (
		<div
			className="mx-2 overflow-y-auto pb-2"
			onMouseLeave={() => dispatch(setHoveredNode(null))}
		>
			<NodeSelectorTree
				getNodeAvailableState={getNodeAvailableState}
				node={firstTreeNode}
				onCheckboxClick={onCheckboxClick}
				onLabelClick={onLabelClick}
				onMouseEnter={onMouseEnter}
				state={nodeSelectorTreeState}
			/>
		</div>
	);
};

export default memo(NodeSelectorTreeContainer);
