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

  // Find all call expressions
  root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'spanStatusfromHttpCode',
    },
  }).forEach((path) => {
    // Create a new Identifier with the name 'getSpanStatusFromHttpCode'
    const newCallee = j.identifier('getSpanStatusFromHttpCode');

    // Replace the old callee with the new one, preserving comments
    replaceWithComments(path.get('callee'), newCallee);
  });

  return root.toSource();
}