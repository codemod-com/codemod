import Text from "@studio/components/Text";
import Tree, { type TreeNode } from "@studio/components/Tree";
import useScrollNodeIntoView from "@studio/hooks/useScrollNodeIntoView";
import {
  useSelectFirstTreeNodeForSnippet,
  useSnippetsStore,
} from "@studio/store/snippets";
import { useEffect, useRef } from "react";

type Props = {
  type: "before" | "after" | "output";
};
const ASTViewer = ({ type }: Props) => {
  const ASTTreeRef = useRef<HTMLDivElement>(null);
  const getFirstTreeNode = useSelectFirstTreeNodeForSnippet();
  const { getSelectedEditors } = useSnippetsStore();
  const {
    [type]: { rootNode },
  } = getSelectedEditors();

  const scrollNodeIntoView = useScrollNodeIntoView();

  const handleNodeClick = (node: TreeNode) => {
    const setRange = getSelectedEditors().setSelection(type);
    console.log("handleNodeClick");
    setRange({
      kind: "FIND_CLOSEST_PARENT",
      ranges: [node],
    });
    scrollNodeIntoView(node, ASTTreeRef);
  };

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
