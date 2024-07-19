import { cn } from "@/utils";
import Text from "@studio/components/Text";
import { useScrollNodeIntoView } from "@studio/main/ASTViewer/useScrollNodeIntoView";
import {
  EditorType,
  useSnippetsStore,
} from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { type NodeApi, Tree } from "react-arborist";
import useResizeObserver from "use-resize-observer";
import { TreeNode } from "@studio/main/ASTViewer/utils";
import { useSelectFirstTreeNodeForSnippet } from "@studio/main/ASTViewer/useSelectFirstTreeNodeForSnippet";



type Node = {
  id?: string;
  actualNode?: any;
  label?: string;
  start?: number;
  end?: number;
  children?: Node[];
  [key: string]: any;
};

export const ASTViewer = ({ type }: {type: EditorType}) => {
  const ASTTreeRef = useRef<HTMLDivElement | null>(null);
  const { width = 0, height = 0 } = useResizeObserver({ ref: ASTTreeRef });
  const getFirstTreeNode = useSelectFirstTreeNodeForSnippet();
  const [firstNode, setFirstNode] = useState<TreeNode | null>(null);
  const { getSelectedEditors } = useSnippetsStore();
  const {
    [type]: { rootNode, ranges },
  } = getSelectedEditors();

  const setRangesOnTarget = useRangesOnTarget();
  const scrollNodeIntoView = useScrollNodeIntoView();

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

  console.log({ranges})
  useEffect(() => {
    console.log('useEffect')
    const firstTreeNode = getFirstTreeNode(type);
    if (firstTreeNode) {
      scrollNodeIntoView(firstTreeNode, ASTTreeRef);
      setFirstNode(firstTreeNode);
    }
  }, [ranges, scrollNodeIntoView, getFirstTreeNode, type]);

  const NodeComponent = ({ node, style, dragHandle }) => {
    const isSelected = firstNode?.id === node.data.id;
    return (
      <div style={style} ref={dragHandle}
           onClick={ (e) => {
             e.stopPropagation();
             handleNodeClick(node);
           } }
      >

        <Text
          className="cursor-pointer whitespace-nowrap"
          color={ isSelected ? "text-cyan-500" : undefined }
        >
          { !node.isLeaf ? (
            <strong
              onClick={ (e) => {
                node.toggle();
                e.stopPropagation();
              }
            }
              className={ cn(node.isOpen ? "text-red-600" : "text-green-500") }
            >
              { node.isOpen ? "- " : "+ " }
            </strong>
          ) : (
            <span>&nbsp;&nbsp;</span>
          ) }
          <span
            className="inline-block"
            id={ node.data.id }
          >
            { node.data.relation && (
              <span className="text-purple-500 mr-1">
                { node.data.relation }:{ " " }
              </span>
            ) }
            { node.data.label }
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



  return (
    <div
      className="flex h-full flex-col w-full overflow-hidden p-2"
      ref={ASTTreeRef}
    >
      <Tree
        data={rootNode?.children ?? []}
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
