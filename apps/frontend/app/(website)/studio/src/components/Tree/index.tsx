import type { Node } from "@babel/types";
import { memo, useEffect, useState } from "react";
import TreeView from "react-treeview";
import Text from "../Text";

type Props = {
  node: TreeNode;
  onClick(node: TreeNode): void;
  selectedNode?: TreeNode;
  selectionStart?: number;
  selectionEnd?: number;
  initialCollapseState?: "collapsed" | "open";
};

type TreeNode = {
  id: string;
  actualNode: Node;
  label: string;
  children?: TreeNode[];
  start: number;
  end: number;
};

let Tree = ({
  node,
  selectedNode,
  selectionStart = 0,
  selectionEnd = 0,
  initialCollapseState = "collapsed",
  onClick,
}: Props) => {
  let [open, setIsOpen] = useState(initialCollapseState === "open");

  let containsSelectedNode =
    !!selectedNode &&
    node.start <= selectedNode.start &&
    node.end >= selectedNode.end;

  useEffect(() => {
    setIsOpen(containsSelectedNode);
  }, [containsSelectedNode]);

  useEffect(() => {
    setIsOpen(initialCollapseState === "open");
  }, [initialCollapseState]);

  let isSelected = selectedNode?.id === node.id;
  let label = (
    <Text
      className="cursor-pointer"
      color={isSelected ? "text-cyan-500" : undefined}
      id={`${node.label}-${node.start}-${node.end}`}
      onClick={() => {
        setIsOpen(!open);
        onClick(node);
      }}
    >
      {node.label}
    </Text>
  );

  if (!node.children?.length) {
    return label;
  }

  return (
    <TreeView collapsed={!open} nodeLabel={label}>
      {open
        ? node.children.map((child, index) => (
            <Tree
              initialCollapseState={initialCollapseState}
              key={index}
              node={child}
              onClick={onClick}
              selectedNode={selectedNode}
              selectionEnd={selectionEnd}
              selectionStart={selectionStart}
            />
          ))
        : null}
    </TreeView>
  );
};

export default memo(Tree);
export type { TreeNode };
