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

  // Step 1: Remove the import statement for Replay
  root.find(j.ImportDeclaration, {
    source: { value: '@sentry/replay' },
  }).forEach((path) => {
    j(path).remove(); // Remove the entire import statement
    dirtyFlag = true;
  });

  // Step 2: Replace new Replay() with Sentry.replayIntegration()
  root.find(j.NewExpression, {
    callee: { name: 'Replay' },
  }).forEach((path) => {
    const newCall = j.callExpression(
      j.memberExpression(
        j.identifier('Sentry'),
        j.identifier('replayIntegration'),
      ),
      path.node.arguments, // Pass the original arguments if any
    );
    replaceWithComments(path, newCall);
    dirtyFlag = true;
  });

  return dirtyFlag ? root.toSource() : undefined;
}