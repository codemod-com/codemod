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
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Helper function to preserve comments when replacing nodes
  function replaceWithComments(
      path: ASTPath<ASTNode & { comments?: CommentKind[] | null }>,
      newNode: Node,
  ) {
      // If the original node had comments, add them to the new node
      if (path.node.comments) {
          newNode.comments = path.node.comments;
      }

      // Replace the node
      j(path).replaceWith(newNode);
  }

  // Replace import { Severity } with import { SeverityLevel }
  root.find(j.ImportDeclaration).forEach((path) => {
      if (
          j.Literal.check(path.node.source) &&
          path.node.source.value === '@sentry/types'
      ) {
          path.node.specifiers.forEach((specifier) => {
              if (
                  j.ImportSpecifier.check(specifier) &&
                  specifier.imported.name === 'Severity'
              ) {
                  specifier.imported.name = 'SeverityLevel';
                  dirtyFlag = true;
              }
          });
      }
  });

  // Replace Severity.<level> with '<level>' and add type annotation : SeverityLevel
  root.find(j.MemberExpression).forEach((path) => {
      if (
          j.Identifier.check(path.node.object) &&
          path.node.object.name === 'Severity'
      ) {
          const severityLevel = path.node.property.name;
          const parent = path.parent.node;

          if (j.VariableDeclarator.check(parent)) {
              const newLiteral = j.literal(severityLevel);
              replaceWithComments(path, newLiteral);
              parent.id.typeAnnotation = j.typeAnnotation(
                  j.genericTypeAnnotation(
                      j.identifier('SeverityLevel'),
                      null,
                  ),
              );
              dirtyFlag = true;
          } else if (j.AssignmentExpression.check(parent)) {
              const newLiteral = j.literal(severityLevel);
              replaceWithComments(path, newLiteral);
              const closestScope = j(path).closestScope();
              closestScope
                  .find(j.VariableDeclarator, {
                      id: { name: parent.left.name },
                  })
                  .forEach((varPath) => {
                      varPath.node.id.typeAnnotation = j.typeAnnotation(
                          j.genericTypeAnnotation(
                              j.identifier('SeverityLevel'),
                              null,
                          ),
                      );
                  });
              dirtyFlag = true;
          } else if (j.ReturnStatement.check(parent)) {
              const newLiteral = j.literal(severityLevel);
              replaceWithComments(path, newLiteral);
              const closestFunction = j(path).closest(j.FunctionDeclaration);
              if (closestFunction.size() > 0) {
                  closestFunction.get().node.returnType = j.typeAnnotation(
                      j.genericTypeAnnotation(
                          j.identifier('SeverityLevel'),
                          null,
                      ),
                  );
              }
              dirtyFlag = true;
          }
      }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
