import type { TreeNode } from "~/components/Tree";

function extractParentNodes(tree: TreeNode, targetNode: TreeNode): TreeNode[] {
	const { children = [], ...rest } = tree;

	const result: TreeNode[] = [];

	if (tree.id === targetNode.id) return result;

	if (tree.start <= targetNode.start && tree.end >= targetNode.end) {
		result.push({ ...rest });
		for (let i = 0; i < children.length; ++i) {
			const nodes = extractParentNodes(children[i]!, targetNode);

			result.push(...nodes);
		}
	}

	return result;
}

export default extractParentNodes;
