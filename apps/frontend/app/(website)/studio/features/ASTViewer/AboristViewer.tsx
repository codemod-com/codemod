import type { Node } from "@babel/types";
import Text from "@studio/components/Text";
import useScrollNodeIntoView from "@studio/hooks/useScrollNodeIntoView";
import {
  useSelectFirstTreeNodeForSnippet,
  useSnippetsStore,
} from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { type NodeRendererProps, Tree } from "react-arborist";
import { flushSync } from "react-dom";
import useResizeObserver from "use-resize-observer";

type TreeNode = {
  id: string;
  actualNode: Node;
  name: string;
  children?: TreeNode[];
  start: number;
  end: number;
};

type Props = {
  type: "before" | "after" | "output";
};

export const ASTViewer = ({ type }: Props) => {
  const ASTTreeRef = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver({ ref: ASTTreeRef });
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

  const NodeComponent: React.FC<NodeRendererProps<TreeNode>> = ({
    node,
    style,
    dragHandle,
  }) => {
    const isSelected = firstNode?.id === node.data.id;
    return (
      <div
        style={style}
        ref={dragHandle}
        onClick={() => handleNodeClick(node.data)}
      >
        <Text
          className="cursor-pointer whitespace-nowrap"
          color={isSelected ? "text-cyan-500" : undefined}
          id={`${node.data.name}-${node.data.start}-${node.data.end}`}
        >
          {node.isLeaf ? "• " : node.isOpen ? "- " : "+ "}
          {node.data.label}
        </Text>
      </div>
    );
  };

  return (
    <div
      className="flex h-full flex-col w-full overflow-hidden p-2"
      ref={ASTTreeRef}
    >
      {rootNode ? (
        <Tree
          data={rootNode.children}
          openByDefault={true}
          width={width}
          height={height}
          indent={12}
          rowHeight={22}
        >
          {NodeComponent}
        </Tree>
      ) : (
        <Text>
          Please provide a snippet to render an Abstract Syntax Tree for it.
        </Text>
      )}
    </div>
  );
};
