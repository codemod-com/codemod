import { type SourceFile, SyntaxKind } from "ts-morph";

// The issue with that approach in this particular codemod is that caller of the .on method
// should be imported from MSW. I believe there is a way to check if the caller is from 3rd party lib
// by going up the import path, but that would require more efforts.
// This codemod is BETA.
function shouldProcessFile(sourceFile: SourceFile): boolean {
  return (
    sourceFile
      .getImportDeclarations()
      .find((decl) =>
        decl.getModuleSpecifier().getLiteralText().startsWith("msw"),
      ) !== undefined
  );
}

// https://mswjs.io/docs/migrations/1.x-to-2.x/#life-cycle-events
export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  if (!shouldProcessFile(sourceFile)) {
    return undefined;
  }

  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((ce) =>
      ce
        .getChildrenOfKind(SyntaxKind.PropertyAccessExpression)[0]
        ?.getText()
        .endsWith(".on"),
    )
    .forEach((eventHandler) => {
      const cbNode = eventHandler.getArguments().at(1);
      if (!cbNode) {
        return;
      }

      const callback =
        cbNode.asKind(SyntaxKind.ArrowFunction) ??
        cbNode.asKind(SyntaxKind.FunctionExpression);

      if (!callback) {
        return;
      }

      const [requestParam, requestIdParam] = callback.getChildrenOfKind(
        SyntaxKind.Parameter,
      );

      const paramsToAdd: string[] = [];

      if (requestParam) {
        requestParam.rename("request");
        requestParam.remove();
        paramsToAdd.push("request");
      }

      if (requestIdParam) {
        requestIdParam.rename("requestId");
        requestIdParam.remove();
        paramsToAdd.push("requestId");
      }

      if (paramsToAdd.length) {
        callback.addParameter({
          name: `{ ${paramsToAdd.join(", ")} }`,
        });
      }
    });

  return sourceFile.getFullText();
}
