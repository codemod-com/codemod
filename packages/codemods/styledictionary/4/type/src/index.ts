import type {
  API,
  ArrowFunctionExpression,
  FileInfo,
  Options,
} from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find all type declarations involving StyleDictionary
  const typeDeclarations = root
    .find(j.TSTypeAliasDeclaration)
    .filter((path) => {
      const { typeAnnotation } = path.node;
      return (
        typeAnnotation.typeName.type === "TSQualifiedName" &&
        typeAnnotation.typeName.left.name === "StyleDictionary"
      );
    });

  if (typeDeclarations.size()) {
    // Extract the names of the types being declared
    const typesToImport = typeDeclarations
      .nodes()
      .map((node) => node.typeAnnotation.typeName.right.name);

    // Add the new type-specific import
    root
      .find(j.Program)
      .get("body", 0)
      .insertBefore(
        j.importDeclaration(
          typesToImport.map((typeName) =>
            j.importSpecifier(j.identifier(typeName)),
          ),
          j.stringLiteral("style-dictionary/types"),
          "type",
        ),
      );

    // Remove the old type declarations
    typeDeclarations.remove();
  }

  return root.toSource();
}
