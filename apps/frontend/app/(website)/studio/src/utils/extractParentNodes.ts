import type { TreeNode } from "@studio/components/Tree";

function extractParentNodes(tree: TreeNode, targetNode: TreeNode): TreeNode[] {
  let { children = [], ...rest } = tree;

  let result: TreeNode[] = [];

  if (tree.id === targetNode.id) return result;

  if (tree.start <= targetNode.start && tree.end >= targetNode.end) {
    result.push({ ...rest });
    for (let i = 0; i < children.length; ++i) {
      let nodes = children[i]
        ? extractParentNodes(children[i], targetNode)
        : [];

      result.push(...nodes);
    }
  }

  return result;
}

export default extractParentNodes;
