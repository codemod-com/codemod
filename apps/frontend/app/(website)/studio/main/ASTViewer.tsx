import Text from "@studio/components/Text";
import Tree, { type TreeNode } from "@studio/components/Tree";
import useScrollNodeIntoView from "@studio/hooks/useScrollNodeIntoView";
import {
  useSelectFirstTreeNodeForSnippet,
  useSnippetsStore,
} from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type Props = {
  type: "before" | "after" | "output";
};
const ASTViewer = ({ type }: Props) => {
  const ASTTreeRef = useRef<HTMLDivElement>(null);
  const getFirstTreeNode = useSelectFirstTreeNodeForSnippet();
  const [firstNode, setFirstNode] = useState<TreeNode | null>(null);
  const { getSelectedEditors } = useSnippetsStore();
  const {
    [type]: { rootNode },
  } = getSelectedEditors();

  const setRangesOnTarget = useRangesOnTarget();
  const scrollNodeIntoView = useScrollNodeIntoView();
  const handleNodeClick = (node: TreeNode = rootNode) => {
    scrollNodeIntoView(node, ASTTreeRef);

    flushSync(() => {
      setFirstNode(node);
      setRangesOnTarget({
        target: type === "before" ? "BEFORE_INPUT" : "AFTER_INPUT",
        ranges: [node],
      });
      const setRange = getSelectedEditors().setSelection(type);
      return setRange({
        kind: "FIND_CLOSEST_PARENT",
        ranges: [node],
      });
    });
  };

  useEffect(() => {
    if (getFirstTreeNode(type) !== null) {
      scrollNodeIntoView(getFirstTreeNode(type), ASTTreeRef);
      setFirstNode(getFirstTreeNode(type));
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
            selectedNode={firstNode}
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
