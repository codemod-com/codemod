import type { Node } from "@babel/types";
import type { TreeNode } from "@studio/components/Tree";

let mapBabelASTToRenderableTree = (babelAstNode: Node): TreeNode => {
  let { type } = babelAstNode;

  let keys = Object.keys(babelAstNode);
  let children: Node[] = [];

  keys.forEach((key) => {
    if (["tokens", "loc"].includes(key)) {
      return;
    }
    let child: Node | Node[] = (
      babelAstNode as unknown as Record<string, Node | Node[]>
    )[key] as Node | Node[];

    if (Array.isArray(child)) {
      children.push(...(child as Node[]));
    } else if (typeof child === "object" && child !== null) {
      children.push(child);
    }
  });

  let mappedNode = {
    id: `${type}_${babelAstNode.start}_${babelAstNode.end}`,
    actualNode: babelAstNode,
    label: type,
    start: babelAstNode.start ?? 0,
    end: babelAstNode.end ?? 0,
    children: children
      .filter((child) => "start" in child && "end" in child && "type" in child)
      .map(mapBabelASTToRenderableTree),
  };

  return mappedNode;
};

export default mapBabelASTToRenderableTree;
