import { cn } from "@/utils";
import type { Node } from "@babel/types";
import Text from "@studio/components/Text";
import { useScrollNodeIntoView } from "@studio/main/ASTViewer/useScrollNodeIntoView";
import {
  useSelectFirstTreeNodeForSnippet,
  useSnippetsStore,
} from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { type NodeRendererProps, Tree } from "react-arborist";
import { flushSync } from "react-dom";
import useResizeObserver from "use-resize-observer";

type TreeNode = {
  id: string;
  actualNode: Node;
  label: string;
  children?: TreeNode[];
  start: number;
  end: number;
};

type EditorType = "before" | "after" | "output";

interface Props {
  type: EditorType;
}

const transformTreeData = (node: TreeNode): TreeNode => ({
  ...node,
  children: node.children?.length
    ? node.children.map(transformTreeData)
    : undefined,
});

export const ASTViewer: React.FC<Props> = ({ type }) => {
  const ASTTreeRef = useRef<HTMLDivElement>(null);
  const { width = 0, height = 0 } = useResizeObserver({ ref: ASTTreeRef });
  const getFirstTreeNode = useSelectFirstTreeNodeForSnippet();
  const [firstNode, setFirstNode] = useState<TreeNode | null>(null);
  const { getSelectedEditors } = useSnippetsStore();
  const {
    [type]: { rootNode },
  } = getSelectedEditors();

  const setRangesOnTarget = useRangesOnTarget();
  const scrollNodeIntoView = useScrollNodeIntoView(type);

  const handleNodeClick = useCallback(
    (node: TreeNode = rootNode) => {
      scrollNodeIntoView(node, ASTTreeRef);

      flushSync(() => {
        setFirstNode(node);
        setRangesOnTarget({
          target: `${type.toUpperCase()}_INPUT`,
          ranges: [node],
        });
        const setRange = getSelectedEditors().setSelection(type);
        setRange({
          kind: "FIND_CLOSEST_PARENT",
          ranges: [node],
        });
      });
    },
    [rootNode, scrollNodeIntoView, setRangesOnTarget, type, getSelectedEditors],
  );

  useEffect(() => {
    const firstTreeNode = getFirstTreeNode(type);
    if (firstTreeNode) {
      scrollNodeIntoView(firstTreeNode, ASTTreeRef);
      setFirstNode(firstTreeNode);
    }
  }, [scrollNodeIntoView, getFirstTreeNode, type]);

  const NodeComponent = React.memo<NodeRendererProps<TreeNode>>(
    ({ node, style, dragHandle }) => {
      const isSelected = firstNode?.id === node.data.id;
      return (
        <div style={style} ref={dragHandle}>
          <Text
            className="cursor-pointer whitespace-nowrap"
            color={isSelected ? "text-cyan-500" : undefined}
          >
            {!node.isLeaf && (
              <strong
                onClick={() => node.toggle()}
                className={cn(
                  node.isOpen ? "text-red-600  " : "text-green-500",
                )}
              >
                {node.isOpen ? "- " : "+ "}
              </strong>
            )}
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(node.data);
              }}
              className="inline-block"
              id={`${node.data.id}`}
            >
              {node.data.label}
            </span>
          </Text>
        </div>
      );
    },
  );

  NodeComponent.displayName = "NodeComponent";

  if (!rootNode) {
    return (
      <div className="flex h-full flex-col w-full overflow-hidden p-2">
        <Text>
          Please provide a snippet to render an Abstract Syntax Tree for it.
        </Text>
      </div>
    );
  }

  const transformedRootNode = transformTreeData(rootNode);

  return (
    <div
      className="flex h-full flex-col w-full overflow-hidden p-2"
      ref={ASTTreeRef}
    >
      <Tree
        data={transformedRootNode.children || []}
        openByDefault={true}
        width={width}
        height={height}
        indent={12}
        rowHeight={22}
      >
        {NodeComponent}
      </Tree>
    </div>
  );
};
