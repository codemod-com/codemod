import { cn } from "@/utils";
import type { Node } from "@babel/types";
import Text from "@studio/components/Text";
import { useScrollNodeIntoView } from "@studio/main/ASTViewer/useScrollNodeIntoView";
import { extractComments } from "@studio/main/ASTViewer/utils";
import {
  useSelectFirstTreeNodeForSnippet,
  useSnippetsStore,
} from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import mapBabelASTToRenderableTree from "@studio/utils/mappers";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { type NodeApi, Tree } from "react-arborist";
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

const removeEmptyChildren = (node: TreeNode): TreeNode => {
  const transformedChildren =
    node.children
      ?.map(removeEmptyChildren)
      .filter((child) => child.children?.length || !child.children) || [];

  return {
    ...node,
    children: transformedChildren.length > 0 ? transformedChildren : undefined,
  };
};

const parseNodeData =
  (node: TreeNode, identifier: string) => (param, index) => ({
    id: `${node.id}-${identifier}-${index}`,
    actualNode: param,
    label: param.type,
    start: param.start,
    end: param.end,
  });
const getPosition = (node: TreeNode) => `${node.start}-${node.end}`;
const transformTreeData = (node: TreeNode, relation?: string): TreeNode => {
  const transformedNode: TreeNode = {
    ...node,
    relation,
    children: [],
  };

  if (node.actualNode.type === "CallExpression") {
    const args = node.actualNode.arguments.map(parseNodeData(node, "arg"));
    const argumentsIds = args.map(getPosition);
    return {
      ...transformedNode,
      children:
        node.children.map((child) => {
          const isParam = argumentsIds.includes(getPosition(child));
          return transformTreeData(child, isParam ? "argument" : child.label);
        }) ?? [],
    };
  }
  if (node.actualNode.type === "FunctionDeclaration") {
    const params = node.actualNode.params.map(parseNodeData(node, "param"));
    const paramsIds = params.map(getPosition);
    const children =
      node.children.map((child) => {
        const isParam = paramsIds.includes(getPosition(child));
        const nameMap = {
          BlockStatement: "body",
          Identifier: "id",
        };
        return transformTreeData(
          child,
          (isParam ? "param" : nameMap[child.label]) ?? child.label,
        );
      }) ?? [];
    return {
      ...transformedNode,
      children,
    };
  }

  const children =
    node.children?.map((child) =>
      transformTreeData(
        child,
        Array.isArray(node.actualNode[node.label])
          ? node.label
          : Object.keys(node.actualNode).find(
              (key) => node.actualNode[key] === child.actualNode,
            ),
      ),
    ) ?? [];

  return { ...transformedNode, children };
};

type Node = {
  id?: string;
  actualNode?: any;
  label?: string;
  start?: number;
  end?: number;
  children?: Node[];
  [key: string]: any;
};

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
    (node: NodeApi<TreeNode> = rootNode) => {
      const data = node.data ?? rootNode;
      scrollNodeIntoView(data, ASTTreeRef);
      setFirstNode(data);
      setRangesOnTarget({
        target: `${type.toUpperCase()}_INPUT`,
        ranges: [data],
      });
      const setRange = getSelectedEditors().setSelection(type);
      setRange({
        kind: "FIND_CLOSEST_PARENT",
        ranges: [data],
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

  const NodeComponent = ({ node, style, dragHandle }) => {
    const isSelected = firstNode?.id === node.data.id;
    return (
      <div style={style} ref={dragHandle}>
        <Text
          className="cursor-pointer whitespace-nowrap"
          color={isSelected ? "text-cyan-500" : undefined}
        >
          {!node.isLeaf ? (
            <strong
              onClick={() => node.toggle()}
              className={cn(node.isOpen ? "text-red-600" : "text-green-500")}
            >
              {node.isOpen ? "- " : "+ "}
            </strong>
          ) : (
            <span>&nbsp;&nbsp;</span>
          )}
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleNodeClick(node);
            }}
            className="inline-block"
            id={node.data.id}
          >
            {node.data.relation && (
              <span className="text-purple-500 mr-1">
                {node.data.relation}:{" "}
              </span>
            )}
            {node.data.label}
          </span>
        </Text>
      </div>
    );
  };

  if (!rootNode) {
    return (
      <div className="flex h-full flex-col w-full overflow-hidden p-2">
        <Text>
          Please provide a snippet to render an Abstract Syntax Tree for it.
        </Text>
      </div>
    );
  }

  const transformedRootNode =
    transformTreeData(mapBabelASTToRenderableTree(rootNode)) ?? null;
  const withComments = removeEmptyChildren(transformedRootNode);
  const { cleanedStructure } = extractComments(withComments);

  return (
    <div
      className="flex h-full flex-col w-full overflow-hidden p-2"
      ref={ASTTreeRef}
    >
      <Tree
        data={cleanedStructure?.children ?? []}
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
