import type { ParameterDeclaration } from "ts-morph";
import {
  type ArrowFunction,
  type Block,
  type CallExpression,
  type FunctionExpression,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";

function getImportDeclarationAlias(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  name: string,
) {
  const importDeclaration = sourceFile.getImportDeclaration(moduleSpecifier);
  if (!importDeclaration) {
    return null;
  }

  const namedImport = importDeclaration
    .getNamedImports()
    .find((specifier) => specifier.getName() === name);

  if (!namedImport) {
    return null;
  }

  return namedImport.getAliasNode()?.getText() ?? namedImport.getName();
}

function isMSWCall(sourceFile: SourceFile, callExpr: CallExpression) {
  const httpCallerName = getImportDeclarationAlias(sourceFile, "msw", "http");
  const graphqlCallerName = getImportDeclarationAlias(
    sourceFile,
    "msw",
    "graphql",
  );

  const identifiers =
    callExpr
      .getChildrenOfKind(SyntaxKind.PropertyAccessExpression)
      .at(0)
      ?.getChildrenOfKind(SyntaxKind.Identifier) ?? [];

  const caller = identifiers.at(0);

  if (!caller) {
    return false;
  }

  const method = identifiers.at(1) ?? caller;

  const methodText = method.getText();

  const isHttpCall =
    caller.getText() === httpCallerName &&
    // This is what would be cool to get through inferring the type via
    // typeChecker/langServer/diagnostics etc, for example
    [
      "all",
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "head",
      "options",
    ].includes(methodText);

  const isGraphQLCall =
    caller.getText() === graphqlCallerName &&
    ["query", "mutation"].includes(methodText);

  return isHttpCall || isGraphQLCall;
}

function getCallbackData(
  expression: CallExpression,
):
  | [
      Block | FunctionExpression | ArrowFunction,
      ReadonlyArray<ParameterDeclaration>,
      FunctionExpression | ArrowFunction,
    ]
  | null {
  const mockCallback = expression.getArguments().at(1) ?? null;

  if (mockCallback === null) {
    return null;
  }

  const cbParams = mockCallback.getChildrenOfKind(SyntaxKind.Parameter);

  const syntaxCb =
    mockCallback.asKind(SyntaxKind.ArrowFunction) ??
    mockCallback.asKind(SyntaxKind.FunctionExpression) ??
    null;

  if (syntaxCb === null) {
    return null;
  }

  const callbackBody =
    mockCallback.getChildrenOfKind(SyntaxKind.Block).at(0) ?? syntaxCb;

  return [callbackBody, cbParams, syntaxCb];
}

function shouldProcessFile(sourceFile: SourceFile): boolean {
  return (
    sourceFile
      .getImportDeclarations()
      .find((decl) =>
        decl.getModuleSpecifier().getLiteralText().startsWith("msw"),
      ) !== undefined
  );
}

// https://mswjs.io/docs/migrations/1.x-to-2.x/#request-changes
export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  if (!shouldProcessFile(sourceFile)) {
    return undefined;
  }

  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((callExpr) => isMSWCall(sourceFile, callExpr))
    .forEach((expression) => {
      const callbackData = getCallbackData(expression);
      if (callbackData === null) {
        return;
      }
      const [callbackBody, callParams, syntaxCb] = callbackData;
      const [reqParam] = callParams;

      const references = reqParam?.findReferencesAsNodes() ?? [];
      references.forEach((ref) => {
        ref.replaceWithText("request");
      });

      const paramList =
        syntaxCb.getLastChildByKind(SyntaxKind.SyntaxList) ?? null;
      const isParenthesized =
        syntaxCb.getChildrenOfKind(SyntaxKind.OpenParenToken).length > 0;
      if (paramList === null) {
        return;
      }

      const possibleParams = ["request", "params", "cookies"];
      const foundDeclarations: string[] = [];
      // In order to prevent duplicate identifier error, since it won't get replaced
      // by fixUnusedIdentifiers call.
      callbackBody
        .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
        .forEach((vd) =>
          possibleParams.forEach((param) => {
            const found =
              vd.getFirstChildIfKind(SyntaxKind.Identifier)?.getText() ===
              param;
            if (found) {
              foundDeclarations.push(param);
            }
          }),
        );

      const toAddFinal = possibleParams.filter(
        (p) => !foundDeclarations.includes(p),
      );
      // paramsToAdd
      const toReplaceWith = `{ ${toAddFinal.join(", ")} }`;
      paramList.replaceWithText(
        isParenthesized ? toReplaceWith : `(${toReplaceWith})`,
      );
    });

  sourceFile.fixUnusedIdentifiers();

  return sourceFile.getFullText();
}
