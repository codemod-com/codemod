import { getPosition } from "@studio/main/ASTViewer/utils";
import { TreeNode } from "@studio/main/ASTViewer/utils";

export const transformTreeData = (node: TreeNode, relation?: string): TreeNode => {
  const transformedNode: TreeNode = {
    ...node,
    relation,
    children: [],
  };

  const parseNodeData =
    (node: TreeNode, identifier: string) => (param) => ({
      id: `${node.id}-${identifier}`,
      actualNode: param,
      label: param.type,
      start: param.start,
      end: param.end,
    });

  if (node.actualNode.type === "CallExpression") {
    const args = node.actualNode.arguments.map(parseNodeData(node, "arg"));
    const argumentsIds = args.map(getPosition);
    return {
      ...transformedNode,
      children:
        node.children?.map((child) => {
          const isParam = argumentsIds.includes(getPosition(child));
          return transformTreeData(child, isParam ? "argument" : child.label);
        }) ?? [],
    };
  }
  if (node.actualNode.type === "FunctionDeclaration") {
    const params = node.actualNode.params.map(parseNodeData(node, "param"));
    const paramsIds = params.map(getPosition);
    const children =
      node.children?.map((child) => {
        const isParam = paramsIds.includes(getPosition(child));
        const nameMap = {
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
  }

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