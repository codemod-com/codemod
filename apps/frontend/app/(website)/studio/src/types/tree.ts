import type { Node } from "@babel/types";

type TreeNode = {
  id: string;
  actualNode: Node;
  label: string;
  children?: TreeNode[];
  start: number;
  end: number;
};

export type { TreeNode };
