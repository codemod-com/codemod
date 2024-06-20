import Text from "@studio/components/Text";
import Tree, { type TreeNode } from "@studio/components/Tree";
import useScrollNodeIntoView from "@studio/hooks/useScrollNodeIntoView";
import { useCallback, useEffect, useRef } from "react";

import { useExecuteRangeCommandOnBeforeInput } from "@studio/store/useExecuteRangeCommandOnBeforeInput";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useSelectFirstTreeNode, useSelectSnippetsFor, } from "@studio/store/zustand/snippets";
import { useSnippetsStore } from "@studio/store/zustand/snippets2";

type Props = {
	type: "before" | "after" | "output";
};
const ASTViewer = ({ type }: Props) => {
	const ASTTreeRef = useRef<HTMLDivElement>(null);
	const executeRangeCommandOnBeforeInputThunk =
		useExecuteRangeCommandOnBeforeInput();
	const { rootNode } = useSelectSnippetsFor(type);
	const getFirstTreeNode = useSelectFirstTreeNode();
	const { setSelections } = useCodemodOutputStore();
	const { getSelectedEditors } = useSnippetsStore();
	const {
		setAfterSnippet
	} = getSelectedEditors()

	const setRange =
		type === "before"
			? executeRangeCommandOnBeforeInputThunk
			: type === "after"
				? setAfterSnippet
				: setSelections;

	const scrollNodeIntoView = useScrollNodeIntoView();

	const handleNodeClick = useCallback(
		(node: TreeNode) => {
			setRange({
				kind: "FIND_CLOSEST_PARENT",
				ranges: [node],
			});
			scrollNodeIntoView(node, ASTTreeRef);
		},
		[scrollNodeIntoView, setRange],
	);

	useEffect(() => {
		if (getFirstTreeNode(type) !== null) {
			scrollNodeIntoView(getFirstTreeNode(type), ASTTreeRef);
		}
	}, [scrollNodeIntoView, getFirstTreeNode, type]);

	return (
		<>
			<div
				className="flex h-full flex-col overflow-y-auto p-2"
				ref={ ASTTreeRef }
			>
				{ rootNode ? (
					<Tree
						initialCollapseState="open"
						node={ rootNode }
						onClick={ handleNodeClick }
						selectedNode={ getFirstTreeNode(type) ?? undefined }
					/>
				) : (
					<Text>
						Please provide a snippet to render an Abstract Syntax Tree for it.
					</Text>
				) }
			</div>
		</>
	);
};

export default ASTViewer;
