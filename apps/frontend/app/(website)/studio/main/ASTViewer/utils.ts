export function extractComments(node: Node): [Node, Node[]] {
  const comments: Node[] = [];
  const seenComments = new Set<string>();

  function traverse(node: Node, parent: Node | null = null) {
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

    const result = {};
    for (const [key, value] of Object.entries(node)) {
      if (key !== "comments" && key !== "internalComments") {
        if (Array.isArray(value)) {
          result[key] = value
            .map((item) => traverse(item, node))
            .filter((item) => item !== undefined);
        } else if (typeof value === "object" && value !== null) {
          const traversed = traverse(value, node);
          if (traversed !== undefined) {
            result[key] = traversed;
          }
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  const cleanedStructure = traverse(node);
  return [cleanedStructure, comments] as [Node, Node[]];
}

export function insertComments(node: Node, comments: Node[]): Node {
  const commentMap = new Map<string, Node[]>();
  comments.forEach((comment) => {
    const key = comment.parentId || "root";
    if (!commentMap.has(key)) {
      commentMap.set(key, []);
    }
    commentMap.get(key)!.push(comment);
  });

  function traverse(node) {
    if (typeof node !== "object" || node === null) {
      return node;
    }

    const result: { [key: string]: any } = { ...node };

    const nodeComments = commentMap.get(node.id || "root") || [];
    if (nodeComments.length > 0) {
      result.comments = nodeComments.map((comment) => ({
        type: comment.actualNode.type,
        value: comment.actualNode.value,
        start: comment.start,
        end: comment.end,
      }));
    }

    for (const key in result) {
      if (key !== "comments") {
        if (Array.isArray(result[key])) {
          result[key] = result[key].map(traverse);
        } else if (typeof result[key] === "object" && result[key] !== null) {
          result[key] = traverse(result[key]);
        }
      }
    }

    return result;
  }

  return traverse(node);
}
