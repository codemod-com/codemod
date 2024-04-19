import type { Node } from "@babel/types";
import type { TreeNode } from "@studio/components/Tree";

const mapBabelASTToRenderableTree = (babelAstNode: Node): TreeNode => {
	const { type } = babelAstNode;

	const keys = Object.keys(babelAstNode);
	const children: Node[] = [];

	keys.forEach((key) => {
		if (["tokens", "loc"].includes(key)) {
			return;
		}
		const child: Node | Node[] = (babelAstNode as any)[key];

		if (Array.isArray(child)) {
			children.push(...(child as Node[]));
		} else if (typeof child === "object" && child !== null) {
			children.push(child);
		}
	});

	const mappedNode = {
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
