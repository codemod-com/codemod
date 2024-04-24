import { type SourceFile, SyntaxKind } from "ts-morph";

function shouldProcessFile(sourceFile: SourceFile): boolean {
  return (
    sourceFile
      .getImportDeclarations()
      .find((decl) =>
        decl.getModuleSpecifier().getLiteralText().startsWith("msw"),
      ) !== undefined
  );
}

// https://mswjs.io/docs/migrations/1.x-to-2.x/#printhandlers
export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  if (!shouldProcessFile(sourceFile)) {
    return undefined;
  }

  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .flatMap((ce) => ce.getDescendantsOfKind(SyntaxKind.Identifier))
    .filter((id) => id.getText() === "printHandlers")
    .forEach((id) => {
      id.replaceWithText("listHandlers");

      const callExpressionEndPosition =
        id
          .getAncestors()
          .find((parent) => parent.getKind() === SyntaxKind.CallExpression)
          ?.getEnd() ?? null;

      if (callExpressionEndPosition === null) {
        return;
      }

      sourceFile
        .insertText(
          callExpressionEndPosition,
          `.forEach((handler) => {
              console.log(handler.info.header)
            })`,
        )
        .formatText();
    });

  return sourceFile.getFullText();
}
