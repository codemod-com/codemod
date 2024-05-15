import { type SourceFile, SyntaxKind } from "ts-morph";

function shouldProcessFile(sourceFile: SourceFile): boolean {
  return true;
}

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  if (!shouldProcessFile(sourceFile)) {
    return undefined;
  }

  sourceFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter((id) => id.getText() === "toReplace")
    .forEach((id) => {
      id.replaceWithText("replacement");
    });

  return sourceFile.getFullText();
}
