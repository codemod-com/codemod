import Text from "@studio/components/Text";
import Tree, { type TreeNode } from "@studio/components/Tree";
import useScrollNodeIntoView from "@studio/hooks/useScrollNodeIntoView";
import {
  useSelectFirstTreeNodeForSnippet,
  useSnippetsStore,
} from "@studio/store/zustand/snippets";
import { useCallback, useEffect, useRef } from "react";

type Props = {
  type: "before" | "after" | "output";
};
const ASTViewer = ({ type }: Props) => {
  const ASTTreeRef = useRef<HTMLDivElement>(null);
  const getFirstTreeNode = useSelectFirstTreeNodeForSnippet();
  const { getSelectedEditors } = useSnippetsStore();
  const {
    setSelection,
    [type]: { rootNode },
  } = getSelectedEditors();

  const setRange = setSelection(type);

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
        ref={ASTTreeRef}
      >
        {rootNode ? (
          <Tree
            initialCollapseState="open"
            node={rootNode}
            onClick={handleNodeClick}
            selectedNode={getFirstTreeNode(type) ?? undefined}
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
