import type { TreeNode } from "@studio/main/ASTViewer/utils";

export function extractComments(node: TreeNode): {
  cleanedStructure: TreeNode;
  comments: TreeNode[];
} {
  const comments: TreeNode[] = [];
  const seenComments = new Set<string>();

  function traverse(node: TreeNode, parent: TreeNode | null = null) {
    if (typeof node !== "object" || node === null) {
      return node;
    }

    if (node.label === "CommentLine" || node.label === "CommentBlock") {
      const commentKey = `${node.start}-${node.end}`;
      if (!seenComments.has(commentKey)) {
        seenComments.add(commentKey);
        comments.push({
          ...node,
          parentId: parent?.id,
          parentStart: parent?.start,
          parentEnd: parent?.end,
        });
      }
      return undefined;
    }

    return Object.entries(node).reduce((acc, [key, value]) => {
      if (key === "comments" || key === "internalComments") return acc;
      if (Array.isArray(value)) {
        const mapped = value
          .map((item) => traverse(item, node))
          .filter((item) => item !== undefined);
        if (mapped.length > 0) return { ...acc, [key]: mapped };
      }
      if (typeof value === "object" && value !== null) {
        const traversed = traverse(value, node);
        return traversed ? { ...acc, [key]: traversed } : acc;
      }
      return { ...acc, [key]: value };
    }, {});
  }

  const cleanedStructure = traverse(node);
  return { cleanedStructure, comments } as {
    cleanedStructure: Node;
    comments: Node[];
  };
}
