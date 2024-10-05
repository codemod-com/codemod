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

  // Function to transform Promise<void | TransportMakeRequestResponse> to Promise<TransportMakeRequestResponse>
  function transformPromiseType(node: ASTNode) {
    if (
      j.TSTypeReference.check(node) &&
      j.Identifier.check(node.typeName) &&
      node.typeName.name === 'Promise'
    ) {
      const typeParams = node.typeParameters;
      if (typeParams && typeParams.params.length === 1) {
        const unionType = typeParams.params[0];
        if (j.TSUnionType.check(unionType)) {
          const filteredTypes = unionType.types.filter(
            (type) => !j.TSVoidKeyword.check(type),
          );
          if (filteredTypes.length === 1) {
            typeParams.params[0] = filteredTypes[0];
            dirtyFlag = true;
          }
        }
      }
    }
  }

  // Transform interface method return types
  root.find(j.TSMethodSignature).forEach((path: ASTPath < ASTNode > ) => {
    const returnType = path.node.typeAnnotation?.typeAnnotation;
    if (returnType) {
      transformPromiseType(returnType);
    }
  });

  // Transform type alias function return types
  root.find(j.TSTypeAliasDeclaration).forEach((path: ASTPath < ASTNode > ) => {
    const typeAnnotation = path.node.typeAnnotation;
    if (j.TSFunctionType.check(typeAnnotation)) {
      const returnType = typeAnnotation.typeAnnotation?.typeAnnotation;
      if (returnType) {
        transformPromiseType(returnType);
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}