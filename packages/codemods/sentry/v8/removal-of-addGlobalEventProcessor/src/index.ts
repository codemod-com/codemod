import type {
  API,
  ASTNode,
  ASTPath,
  Block,
  CommentBlock,
  CommentLine,
  FileInfo,
  Line,
  Node,
  Options,
} from 'jscodeshift';

type CommentKind = Block | Line | CommentBlock | CommentLine;

export default function transform(
  file: FileInfo,
  api: API,
  options ? : Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Helper function to preserve comments when replacing nodes
  function replaceWithComments(
    path: ASTPath < ASTNode & { comments ? : CommentKind[] | null } > ,
    newNode: Node,
  ) {
    // If the original node had comments, add them to the new node
    if (path.node.comments) {
      newNode.comments = path.node.comments;
    }

    // Replace the node
    j(path).replaceWith(newNode);
  }

  // Find all calls to `Sentry.addGlobalEventProcessor`
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'Sentry' },
      property: { name: 'addGlobalEventProcessor' },
    },
  }).forEach((path) => {
    if (j.MemberExpression.check(path.value.callee)) {
      // Replace `Sentry.addGlobalEventProcessor` with `Sentry.getGlobalScope().addEventProcessor`
      const newCallee = j.memberExpression(
        j.callExpression(
          j.memberExpression(
            j.identifier('Sentry'),
            j.identifier('getGlobalScope'),
          ),
          [],
        ),
        j.identifier('addEventProcessor'),
      );

      // Use the helper function to replace the node while preserving comments
      replaceWithComments(
        path,
        j.callExpression(newCallee, path.node.arguments),
      );
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}