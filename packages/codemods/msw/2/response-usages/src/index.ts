import type { Node, ParameterDeclaration } from "ts-morph";
import {
  type ArrowFunction,
  type Block,
  type CallExpression,
  type FunctionExpression,
  type ImportSpecifier,
  type SourceFile,
  SyntaxKind,
  createWrappedNode,
  ts,
} from "ts-morph";

function addNamedImportDeclaration(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  name: string,
): ImportSpecifier {
  const importDeclaration =
    sourceFile.getImportDeclaration(moduleSpecifier) ??
    sourceFile.addImportDeclaration({ moduleSpecifier });

  const existing = importDeclaration
    .getNamedImports()
    .find((specifier) => specifier.getName() === name);

  return existing ?? importDeclaration.addNamedImport({ name });
}

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
      Block | Node,
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

  const lastCallbackChild =
    mockCallback.getLastChildIfKind(SyntaxKind.Block) ??
    mockCallback.getLastChild<Node>() ??
    null;

  if (lastCallbackChild === null) {
    return null;
  }

  return [lastCallbackChild, cbParams, syntaxCb];
}

const contentTypeToMethod: Record<string, string> = {
  "application/json": "json",
  "application/xml": "xml",
  "text/plain": "text",
};

function shouldProcessFile(sourceFile: SourceFile): boolean {
  return (
    sourceFile
      .getImportDeclarations()
      .find((decl) =>
        decl.getModuleSpecifier().getLiteralText().startsWith("msw"),
      ) !== undefined
  );
}

function processMSWExpression(
  sourceFile: SourceFile,
  expression: CallExpression,
) {
  let shouldQuitAndReprocess = false;

  const callbackData = getCallbackData(expression);
  if (callbackData === null) {
    return;
  }

  let [callbackBody, callbackParams, syntaxCb] = callbackData;
  const [, resParam, ctxParam] = callbackParams;
  if (!resParam) {
    return;
  }

  (callbackBody.asKind(SyntaxKind.Block) ?? callbackBody.getParent())
    ?.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(
      (callExpr) =>
        callExpr
          .getDescendantsOfKind(SyntaxKind.Identifier)
          .at(0)
          ?.getText() === resParam.getText(),
    )
    .forEach((callExpr) => {
      const [, resMethod] =
        callExpr
          .getFirstChild()
          ?.getChildrenOfKind(SyntaxKind.Identifier)
          .map((c) => c.getText()) ?? [];

      // https://mswjs.io/docs/migrations/1.x-to-2.x/#resonce
      if (resMethod === "once") {
        expression.addArgument("{ once: true }");
      }

      const intrinsicCtxCalls = callExpr
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter(
          (ce) =>
            ce.getDescendantsOfKind(SyntaxKind.Identifier).at(0)?.getText() ===
            ctxParam?.getText(),
        );

      let httpResponseMethod: string | null = null;
      let httpResponseBody: Record<string, unknown> | string | null = null;
      let httpResponseTypeNodes: ts.TypeNode[] | null = null;
      let httpResponseCookieString: string | null = null;
      let httpResponseStatus: string | null = null;
      const httpResponseHeaders: Record<string, string> = {};
      let httpResponseData: string | null = null;
      let httpResponseErrors: string | null = null;
      let httpResponseExtensions: string | null = null;

      for (const call of intrinsicCtxCalls) {
        if (!call) throw new Error();
        if (call.wasForgotten()) {
          shouldQuitAndReprocess = true;
          break;
        }

        const ctxCallTypeArgs = call.getTypeArguments();
        const ctxCallArgs = call.getArguments();
        const ctxCallPropertyAccessor = call
          .getExpression()
          .getLastChildByKind(SyntaxKind.Identifier);

        if (!ctxCallPropertyAccessor) {
          continue;
        }

        const callType = ctxCallPropertyAccessor.getText();
        const stringArgs = ctxCallArgs.map(
          (arg) =>
            arg.asKind(SyntaxKind.StringLiteral)?.getLiteralText() ??
            arg.getText(),
        );
        const joinedArgs = stringArgs.join(", ");

        if (["json", "xml", "text"].includes(callType)) {
          httpResponseMethod = callType;
          httpResponseBody = joinedArgs;
          httpResponseTypeNodes = ctxCallTypeArgs.map(
            (tArg) => tArg.compilerNode,
          );
        } else if (callType === "status") {
          httpResponseStatus = joinedArgs;
        } else if (callType === "cookie") {
          const [cookieName, cookieValue] = stringArgs;
          if (!cookieName || !cookieValue) {
            continue;
          }

          if (httpResponseCookieString === null) {
            httpResponseCookieString = "";
          }

          httpResponseCookieString += `${cookieName}=${encodeURIComponent(
            cookieValue,
          )};`;
        } else if (callType === "set") {
          const [headerName, headerValue] = stringArgs;
          if (!headerName || !headerValue) {
            continue;
          }

          if (headerName.toLowerCase() === "content-type") {
            httpResponseMethod =
              httpResponseMethod ??
              contentTypeToMethod[headerValue.toLowerCase()] ??
              null;
          } else {
            httpResponseHeaders[headerName] = headerValue;
          }
        } else if (callType === "delay") {
          addNamedImportDeclaration(sourceFile, "msw", "delay");

          let posBeforeDelayed = call.getParent()?.getChildIndex();

          if (!posBeforeDelayed) {
            continue;
          }

          call
            .getParent()
            ?.asKindOrThrow(SyntaxKind.CallExpression)
            .removeArgument(call);

          if (callbackBody.getKind() !== SyntaxKind.Block) {
            const blockExpression = createWrappedNode(
              ts.factory.createBlock([
                ts.factory.createReturnStatement(
                  callbackBody.compilerNode as ts.Expression,
                ),
              ]),
              { sourceFile: sourceFile.compilerNode },
            ).asKindOrThrow(SyntaxKind.Block);

            const printer = ts.createPrinter({
              newLine: ts.NewLineKind.LineFeed,
            });
            const result = printer.printNode(
              ts.EmitHint.Unspecified,
              blockExpression.compilerNode,
              sourceFile.compilerNode,
            );

            callbackBody.replaceWithText(result);
            const newCallbackData = getCallbackData(expression);
            if (newCallbackData === null) {
              throw new Error();
            }
            const [newCallbackBody, newCallbackParams, newSyntaxCb] =
              newCallbackData;
            callbackBody = newCallbackBody;
            callbackParams = newCallbackParams;
            syntaxCb = newSyntaxCb;

            posBeforeDelayed = 0;
          }

          callbackBody
            .asKindOrThrow(SyntaxKind.Block)
            .insertStatements(
              posBeforeDelayed,
              `await delay(${Number(joinedArgs)});`,
            );

          if (!syntaxCb.isAsync()) {
            syntaxCb.setIsAsync(true);
          }
        } else if (callType === "data") {
          httpResponseData = joinedArgs;
        } else if (callType === "errors") {
          httpResponseErrors = joinedArgs;
        } else if (callType === "extensions") {
          httpResponseExtensions = joinedArgs;
        } else if (callType === "body") {
          httpResponseBody = httpResponseBody ?? joinedArgs;
        }
      }

      if (shouldQuitAndReprocess) {
        return;
      }

      const headers = Object.entries(httpResponseHeaders).map(([key, value]) =>
        ts.factory.createPropertyAssignment(
          ts.factory.createStringLiteral(key),
          ts.factory.createStringLiteral(value),
        ),
      );

      if (httpResponseCookieString) {
        headers.push(
          ts.factory.createPropertyAssignment(
            ts.factory.createStringLiteral("Set-Cookie"),
            ts.factory.createStringLiteral(httpResponseCookieString),
          ),
        );
      }

      const resOptions = [
        ...(httpResponseStatus
          ? [
              ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("status"),
                ts.factory.createNumericLiteral(httpResponseStatus),
              ),
            ]
          : []),
        ...(headers.length
          ? [
              ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("headers"),
                ts.factory.createObjectLiteralExpression(headers, false),
              ),
            ]
          : []),
      ];

      const responseCall = createWrappedNode(
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("HttpResponse"),
            ts.factory.createIdentifier(httpResponseMethod ?? "json"),
          ),
          httpResponseTypeNodes ?? undefined,
          resOptions.length
            ? [ts.factory.createObjectLiteralExpression(resOptions, false)]
            : undefined,
        ),
        { sourceFile: sourceFile.compilerNode },
      ).asKindOrThrow(SyntaxKind.CallExpression);
      const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
      });
      const result = printer.printNode(
        ts.EmitHint.Unspecified,
        responseCall.compilerNode,
        sourceFile.compilerNode,
      );

      callExpr.replaceWithText(result);
      callExpr.insertArgument(0, httpResponseBody ?? "null");

      if (httpResponseData || httpResponseErrors || httpResponseExtensions) {
        const tsMorphOptsNode = (
          callExpr.getArguments().at(1) ?? callExpr.insertArgument(1, "{}")
        ).asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

        if (httpResponseData) {
          tsMorphOptsNode.addPropertyAssignment({
            name: "data",
            initializer: httpResponseData,
          });
        }
        if (httpResponseErrors) {
          tsMorphOptsNode.addPropertyAssignment({
            name: "errors",
            initializer: httpResponseErrors,
          });
        }
        if (httpResponseExtensions) {
          tsMorphOptsNode.addPropertyAssignment({
            name: "extensions",
            initializer: httpResponseExtensions,
          });
        }
      }

      callExpr.formatText();
    });

  if (shouldQuitAndReprocess) {
    return processMSWExpression(sourceFile, expression);
  }
}

// https://mswjs.io/docs/migrations/1.x-to-2.x/#response-declaration
// https://mswjs.io/docs/migrations/1.x-to-2.x/#context-utilities
export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  if (!shouldProcessFile(sourceFile)) {
    return undefined;
  }

  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((callExpr) => isMSWCall(sourceFile, callExpr))
    .forEach((expression) => processMSWExpression(sourceFile, expression));

  addNamedImportDeclaration(sourceFile, "msw", "HttpResponse");

  return sourceFile.getFullText();
}
