// BUILT WITH https://codemod.studio

import type { API, FileInfo, JSCodeshift } from "jscodeshift";
import { findPatterns, getClassMethod } from "./analyze.js";

//  const FooContext = React.createContext();
const buildContextVariableDeclaration = (j: JSCodeshift) =>
  j.variableDeclaration("const", [
    j.variableDeclarator(
      j.identifier("Context"),
      j.callExpression(
        j.memberExpression(
          j.identifier("React"),
          j.identifier("createContext"),
        ),
        [],
      ),
    ),
  ]);

const buildContextProvider = (j: JSCodeshift, value: any, renderedJsx: any) =>
  j.jsxElement(
    j.jsxOpeningElement(j.jsxIdentifier("Context"), [
      j.jsxAttribute(j.jsxIdentifier("value"), j.jsxExpressionContainer(value)),
    ]),
    j.jsxClosingElement(j.jsxIdentifier("Context")),
    [renderedJsx],
  );

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  findPatterns(j, root).forEach((pattern) => {
    if (!pattern) {
      return;
    }
    const { classComponent, getChildContext, childContextTypes } = pattern;

    const childContextValue =
      j(getChildContext).find(j.ReturnStatement).paths().at(0)?.value
        .argument ?? null;

    j(childContextTypes).remove();
    j(getChildContext).remove();

    // add Context variable declaration
    const variableDeclaration = buildContextVariableDeclaration(j);
    classComponent.insertBefore(variableDeclaration);

    const render = getClassMethod(j, classComponent, "render");

    const renderReturnStatement = render
      ? j(render).find(j.ReturnStatement).paths().at(0)
      : null;

    const renderedJsx = renderReturnStatement?.value.argument;

    if (!renderedJsx) {
      return;
    }

    renderReturnStatement.value.argument = buildContextProvider(
      j,
      childContextValue,
      renderedJsx,
    );
  });

  return root.toSource();
}
