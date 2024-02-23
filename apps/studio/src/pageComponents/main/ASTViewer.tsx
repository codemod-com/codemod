/* eslint-disable no-nested-ternary */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '~/store';
import { executeRangeCommandOnBeforeInputThunk } from '~/store/executeRangeCommandOnBeforeInputThunk';
import { selectActiveSnippet } from '~/store/slices/view';
import { RangeCommand } from '~/utils/tree';
import Text from '../../components/Text';
import Tree, { type TreeNode } from '../../components/Tree';
import useScrollNodeIntoView from '../../hooks/useScrollNodeIntoView';
import { codemodOutputSlice } from '../../store/slices/codemodOutput';
import {
	selectFirstTreeNode,
	selectSnippetsFor,
	setOutputSelection,
} from '../../store/slices/snippets';

type Props = {
	type: 'before' | 'after' | 'output';
};

const ASTViewer = ({ type }: Props) => {
	const ASTTreeRef = useRef<HTMLDivElement>(null);
	const activeSnippet = useSelector(selectActiveSnippet);
	const { rootNode } = useSelector(selectSnippetsFor(type, activeSnippet));
	const firstTreeNode = useSelector(selectFirstTreeNode(type, activeSnippet));

	const setRange = useMemo(() => {
		switch (type) {
			case 'before':
				return (range: RangeCommand) =>
					executeRangeCommandOnBeforeInputThunk({
						name: activeSnippet,
						range,
					});
			case 'after':
				return (range: RangeCommand) =>
					setOutputSelection({
						name: activeSnippet,
						range,
					});
			case 'output':
			default:
				return codemodOutputSlice.actions.setSelections;
		}
	}, [activeSnippet, type]);

	const scrollNodeIntoView = useScrollNodeIntoView();
	const dispatch = useAppDispatch();

	const handleNodeClick = useCallback(
		(node: TreeNode) => {
			dispatch(
				setRange({
					kind: 'FIND_CLOSEST_PARENT',
					ranges: [node],
				}),
			);
			scrollNodeIntoView(node, ASTTreeRef);
		},
		[scrollNodeIntoView, setRange, dispatch],
	);

	useEffect(() => {
		if (firstTreeNode !== null) {
			scrollNodeIntoView(firstTreeNode, ASTTreeRef);
		}
	}, [scrollNodeIntoView, firstTreeNode]);

	return (
		<>
			<div
				className="flex h-full flex-col overflow-y-auto p-2"
				ref={ASTTreeRef}
			>
				{rootNode ? (
					<Tree
						node={rootNode}
						onClick={handleNodeClick}
						selectedNode={firstTreeNode ?? undefined}
					/>
				) : (
					<Text>
						Please provide a snippet to render an Abstract Syntax
						Tree for it.
					</Text>
				)}
			</div>
		</>
	);
};

export default ASTViewer;
