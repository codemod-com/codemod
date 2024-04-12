import type { Node } from "@babel/types";

type TreeNode = {
	id: string;
	actualNode: Node;
	label: string;
	children?: TreeNode[];
	start: number;
	end: number;
};

// eslint-disable-next-line import/prefer-default-export
export type { TreeNode };
