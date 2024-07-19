import { type TreeNode, getPosition } from "@studio/main/ASTViewer/utils";

const specialNodes = ["CallExpression", "FunctionDeclaration"] as const;
type NodeTypes = (typeof specialNodes)[number];
type NodeTransformer = (node: TreeNode, transformedNode) => TreeNode;
type NodeTypeMap = {
  [key in NodeTypes]: NodeTransformer;
} & Record<string, NodeTransformer>;

const parseNodeData =
  (node: TreeNode, identifier: string) => (param: TreeNode) => ({
    id: `${node.id}-${identifier}`,
    actualNode: param,
    label: param.type,
    start: param.start,
    end: param.end,
  });

const transformCallExpression: NodeTransformer = (
  node: TreeNode,
  transformedNode,
): TreeNode => {
  if (node.actualNode.type !== "CallExpression") return;
  const args = (node.actualNode.arguments as TreeNode[]).map(
    parseNodeData(node, "arg"),
  );
  const argumentsIds = args.map(getPosition);
  return {
    ...transformedNode,
    children:
      node.children?.map((child) => {
        const isParam = argumentsIds.includes(getPosition(child));
        return transformTreeData(child, isParam ? "argument" : child.label);
      }) ?? [],
  };
};

const transformFunctionDeclaration: NodeTransformer = (
  node: TreeNode,
  transformedNode,
): TreeNode => {
  if (node.actualNode.type !== "FunctionDeclaration") return;
  const params = (node.actualNode.params as TreeNode[]).map(
    parseNodeData(node, "param"),
  );
  const paramsIds = params.map(getPosition);
  const children =
    node.children?.map((child) => {
      const isParam = paramsIds.includes(getPosition(child));
      const nameMap: Record<string, string> = {
        BlockStatement: "body",
        Identifier: "id",
      };
      return transformTreeData(
        child,
        (isParam ? "param" : nameMap[child.label]) ?? child.label,
      );
    }) ?? [];
  return {
    ...transformedNode,
    children,
  };
};

const transformDefault: NodeTransformer = (
  node: TreeNode,
  transformedNode,
): TreeNode => {
  const children =
    node.children?.map((child) =>
      transformTreeData(
        child,
        Array.isArray(node.actualNode[node.label])
          ? node.label
          : Object.keys(node.actualNode).find(
              (key) => node.actualNode[key] === child.actualNode,
            ),
      ),
    ) ?? [];

  return { ...transformedNode, children };
};

const transformers: NodeTypeMap = {
  CallExpression: transformCallExpression,
  FunctionDeclaration: transformFunctionDeclaration,
  other: transformDefault,
};

export const transformTreeData = (
  node: TreeNode,
  relation?: string,
): TreeNode => {
  const transformedNode: TreeNode = {
    ...node,
    relation,
    children: [],
  };

  const type = specialNodes.includes(node.actualNode.type)
    ? node.actualNode.type
    : "other";
  return transformers[type](node, transformedNode);
};
