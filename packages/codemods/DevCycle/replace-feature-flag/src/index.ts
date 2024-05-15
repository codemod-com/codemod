import { type SourceFile, SyntaxKind } from "ts-morph";

function shouldProcessFile(sourceFile: SourceFile): boolean {
  return true;
}

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  if (!shouldProcessFile(sourceFile)) {
    return undefined;
  }

  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .flatMap((ce) => ce.getDescendantsOfKind(SyntaxKind.Identifier))
    .filter((id) => id.getText() === "name")
    .forEach((id) => {
      id.replaceWithText("replacement");
    });

  return sourceFile.getFullText();
}
