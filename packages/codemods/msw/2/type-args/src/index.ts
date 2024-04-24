import {
  type ArrowFunction,
  type Block,
  type CallExpression,
  type FunctionExpression,
  type ParameterDeclaration,
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

  return namedImport.getAliasNode()?.getText() || namedImport.getName();
}

function addNamedImportDeclaration(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  name: string,
  isTypeOnly?: boolean,
) {
  const importDeclaration =
    sourceFile.getImportDeclaration(moduleSpecifier) ||
    sourceFile.addImportDeclaration({ moduleSpecifier });

  if (
    importDeclaration
      .getNamedImports()
      .some((specifier) => specifier.getName() === name)
  ) {
    return importDeclaration;
  }

  return importDeclaration.addNamedImport({ name, isTypeOnly });
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

function isNeitherNullNorUndefined<T>(
  t: NonNullable<T> | null | undefined,
): t is NonNullable<T> {
  return t !== null && t !== undefined;
}

function deleteByPos(
  sourceFile: SourceFile,
  positionObject: Record<number, string>,
) {
  let offset = 0;
  Object.entries(positionObject)
    .sort(([pos1], [pos2]) => +pos1 - +pos2)
    .forEach(([pos, value]) => {
      sourceFile.insertText(+pos + offset, value);
      offset += value.length;
    });
  Object.getOwnPropertyNames(positionObject).forEach((prop) => {
    delete positionObject[Number(prop)];
  });
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

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  if (!shouldProcessFile(sourceFile)) {
    return undefined;
  }

  const toInsertManually: Record<number, string> = {};

  // Unwrap MockedRequest
  sourceFile
    .getDescendantsOfKind(SyntaxKind.TypeReference)
    .filter((tr) => tr.getText().startsWith("MockedRequest"))
    .forEach((tr) => {
      const [bodyType] = tr.getTypeArguments();
      if (bodyType === undefined) {
        return;
      }

      tr.replaceWithText(bodyType.getText());
    });

  // ResponseResolver
  let modifiedResponseResolver = false;

  sourceFile
    .getDescendantsOfKind(SyntaxKind.TypeReference)
    .filter((tr) => tr.getText().startsWith("ResponseResolver"))
    .forEach((tr) => {
      const [bodyType, ctxType] = tr.getTypeArguments();
      if (bodyType === undefined) {
        return;
      }

      if (bodyType.getText() === "RestRequest") {
        bodyType.replaceWithText("DefaultBodyType");
        addNamedImportDeclaration(sourceFile, "msw", "DefaultBodyType");
      }

      if (ctxType) {
        ctxType.replaceWithText(bodyType.getText());
      } else {
        tr.insertTypeArgument(1, bodyType.getText());
      }

      bodyType.replaceWithText("HttpRequestResolverExtras<PathParams>");

      modifiedResponseResolver = true;
    });

  if (modifiedResponseResolver) {
    addNamedImportDeclaration(
      sourceFile,
      "msw/lib/core/handlers/HttpHandler",
      "HttpRequestResolverExtras",
      true,
    );
    addNamedImportDeclaration(sourceFile, "msw", "PathParams", true);
  }

  // const handlers: RestHandler<BodyType>[] => const handlers = [http.get<any, BodyType>()]
  sourceFile
    .getDescendantsOfKind(SyntaxKind.TypeReference)
    .filter((tr) => tr.getText().startsWith("HttpHandler"))
    .forEach((tr) => {
      if (tr.getText() !== "HttpHandler") {
        const [bodyType, paramsType, resBodyType] = tr.getTypeArguments();

        if (bodyType === undefined) {
          return;
        }

        const parentBlock =
          tr.getFirstAncestorByKind(SyntaxKind.VariableDeclaration) ??
          tr.getFirstAncestorByKind(SyntaxKind.FunctionExpression) ??
          null;

        if (parentBlock === null) {
          return;
        }

        const toReplaceReferenceWith = "HttpHandler";

        parentBlock
          .getDescendantsOfKind(SyntaxKind.CallExpression)
          .filter((callExpr) => isMSWCall(sourceFile, callExpr))
          .forEach((expression) => {
            const genericTypeArgs = expression.getTypeArguments();

            const newArgs = [
              paramsType?.getText() || "any",
              bodyType.getText(),
              resBodyType?.getText() || undefined,
            ].filter(isNeitherNullNorUndefined);

            if (genericTypeArgs.length) {
              expression.insertTypeArguments(0, newArgs);
              genericTypeArgs.forEach((arg) =>
                expression.removeTypeArgument(arg),
              );
            } else {
              const braceToken =
                expression.getFirstChildByKind(SyntaxKind.OpenParenToken) ??
                null;

              if (braceToken === null) {
                return;
              }

              // To avoid messing up the insert indices
              const deletionShift =
                braceToken.getEnd() -
                (1 + (tr.getText().length - toReplaceReferenceWith.length));

              toInsertManually[deletionShift] = `<${newArgs.join(", ")}>`;
            }
          });

        tr.replaceWithText(toReplaceReferenceWith);
      }
    });

  deleteByPos(sourceFile, toInsertManually);

  // Body casts
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((callExpr) => isMSWCall(sourceFile, callExpr))
    .forEach((expression) => {
      const callbackData = getCallbackData(expression);
      if (callbackData === null) {
        return;
      }
      const [callbackBody] = callbackData;

      const bodyCasts = callbackBody
        .getDescendantsOfKind(SyntaxKind.AsExpression)
        .filter((asExpr) =>
          asExpr
            .getDescendantsOfKind(SyntaxKind.Identifier)
            .find((id) => id.getText() === "body"),
        );

      if (bodyCasts.length) {
        bodyCasts.forEach((asExpr) => {
          const castedProperty = asExpr.getFirstChild()?.getText() ?? null;
          const castedToType =
            asExpr
              .getChildrenOfKind(SyntaxKind.TypeReference)
              .at(0)
              ?.getText() ?? null;

          if (castedProperty === null || castedToType === null) {
            return;
          }

          asExpr.replaceWithText(castedProperty);

          const existingBodyType = expression.getTypeArguments().at(1) ?? null;

          if (existingBodyType !== null) {
            existingBodyType.replaceWithText(castedToType);
          } else {
            const callerEndPos = expression.getFirstChild()?.getEnd() ?? null;

            if (callerEndPos === null) {
              return;
            }

            // Has to be done like that, because addTypeArguments throws if no <> (generic braces) are there,
            // and insertText forgets all the previously navigated nodes, so it breaks the forEach loop.
            // Uncomment below and read the function jsdoc:
            // sourceFile.insertText(callerEndPos, `<any, ${castedToType}>`);

            // using new Map would be nicer, but it's harder to iterate over, so whatever
            toInsertManually[callerEndPos] = `<any, ${castedToType}>`;
          }
        });
      }
    });

  deleteByPos(sourceFile, toInsertManually);

  sourceFile.fixUnusedIdentifiers();

  return sourceFile.getFullText();
}
