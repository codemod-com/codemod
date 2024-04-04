/* eslint-disable no-nested-ternary */
import { useCallback, useEffect, useRef } from "react";
import Text from "../../components/Text";
import Tree, { type TreeNode } from "../../components/Tree";
import useScrollNodeIntoView from "../../hooks/useScrollNodeIntoView";

import { SnippetType } from "~/pageComponents/main/PageBottomPane";
import { useExecuteRangeCommandOnBeforeInput } from "~/store/useExecuteRangeCommandOnBeforeInput";
import { useCodemodOutputStore } from "~/store/zustand/codemodOutput";
import {
	useSelectFirstTreeNode,
	useSelectSnippetsFor,
	useSnippetStore,
} from "~/store/zustand/snippets";

type Props = {
	type: "before" | "after" | "output";
};

export const useSnippetRootNode = (type: SnippetType) => {
	const { rootNode } = useCodemodOutputStore();
};
const ASTViewer = ({ type }: Props) => {
	const ASTTreeRef = useRef<HTMLDivElement>(null);
	const executeRangeCommandOnBeforeInputThunk =
		useExecuteRangeCommandOnBeforeInput();
	const { rootNode } = useSelectSnippetsFor(type);
	const firstTreeNode = useSelectFirstTreeNode(type);
	const { setSelections } = useCodemodOutputStore();
	const { setOutputSelection } = useSnippetStore();

	const setRange =
		type === "before"
			? executeRangeCommandOnBeforeInputThunk
			: type === "after"
			  ? setOutputSelection
			  : setSelections;

	const scrollNodeIntoView = useScrollNodeIntoView();

	const handleNodeClick = useCallback(
		(node: TreeNode) => {
			setRange({
				kind: "FIND_CLOSEST_PARENT",
				ranges: [node],
			}),
				scrollNodeIntoView(node, ASTTreeRef);
		},
		[scrollNodeIntoView, setRange],
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
						Please provide a snippet to render an Abstract Syntax Tree for it.
					</Text>
				)}
			</div>
		</>
	);
};

export default ASTViewer;
