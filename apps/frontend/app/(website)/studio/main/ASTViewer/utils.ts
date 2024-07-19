import type { Node } from "@babel/types";
import { isFile } from "@babel/types";
import { extractComments } from "@studio/main/ASTViewer/extractComments";
import { transformTreeData } from "@studio/main/ASTViewer/transformTreeData";
import type { EditorType } from "@studio/store/snippets";
import { parseSnippet } from "@studio/utils/babelParser";
import mapBabelASTToRenderableTree from "@studio/utils/mappers";

export type TreeNode = {
  id: string;
  actualNode: Node;
  label: string;
  children?: TreeNode[];
  start: number;
  end: number;
  relation?: string;
};

export const getPosition = (node: { start: number; end: number }) =>
  `${node.start}-${node.end}`;

export function addCounterToNodeIds(
  root: TreeNode,
  type: EditorType,
): TreeNode {
  let counter = 0;

  function traverse(node: TreeNode): TreeNode {
    const newNode: TreeNode = {
      ...node,
      id: `${node.id}_${counter++}_${type}`,
      children: node.children?.map(traverse),
    };

    return newNode;
  }

  return traverse(root);
}

export const removeEmptyChildren = (node: TreeNode): TreeNode => {
  const transformedChildren =
    node.children
      ?.map(removeEmptyChildren)
      .filter((child) => child.children?.length || !child.children) ?? [];

  return {
    ...node,
    children: transformedChildren.length > 0 ? transformedChildren : undefined,
  };
};

export const transformNode = (content: string, type: EditorType) => {
  const parsed = parseSnippet(content);
  const rootNode = isFile(parsed) ? mapBabelASTToRenderableTree(parsed) : null;
  if (!rootNode) {
    return null;
  }
  const transformedRootNode =
    transformTreeData(mapBabelASTToRenderableTree(rootNode as Node)) ?? null;
  const withComments = removeEmptyChildren(transformedRootNode);
  const withUniqueIds = addCounterToNodeIds(withComments, type);
  const { cleanedStructure } = extractComments(withUniqueIds);
  return cleanedStructure;
};
