import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options: Options,
): string | undefined {
  const functionName = String(options.functionName ?? "isFlagEnabled");
  const featureFlagName = String(options.featureFlagName ?? "featureFlag");

  let dirtyFlag = false;

  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: functionName,
      },
      arguments: [
        {
          type: "StringLiteral" as const,
          value: featureFlagName,
        },
      ],
    })
    .replaceWith(() => {
      dirtyFlag = true;

      return {
        type: "BooleanLiteral",
        value: true,
      };
    });

  root
    .find(j.VariableDeclarator, {
      type: "VariableDeclarator",
      id: {
        type: "ArrayPattern",
      },
      init: {
        type: "AwaitExpression",
        argument: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: {
              type: "Identifier",
              name: "Promise",
            },
            property: {
              type: "Identifier",
              name: "all",
            },
          },
          arguments: [
            {
              type: "ArrayExpression" as const,
            },
          ],
        },
      },
    })
    .forEach((variableDeclarator) => {
      const { node } = variableDeclarator;

      if (node.id.type !== "ArrayPattern") {
        return;
      }

      if (node.init?.type !== "AwaitExpression") {
        return;
      }

      if (node.init.argument?.type !== "CallExpression") {
        return;
      }

      if (node.init.argument.arguments[0]?.type !== "ArrayExpression") {
        return;
      }

      const indices: number[] = [];

      const { elements } = node.init.argument.arguments[0];

      elements.forEach((element, index) => {
        if (element?.type === "BooleanLiteral" && element.value) {
          indices.push(index);
        }
      });

      if (indices.length === 0) {
        return;
      }

      dirtyFlag = true;

      const identifierNames: string[] = [];

      node.id.elements
        .filter((_, index) => indices.some((i) => index === i))
        .forEach((element) => {
          if (element?.type === "Identifier") {
            identifierNames.push(element.name);
          }
        });

      node.id.elements = node.id.elements.filter(
        (_, index) => !indices.some((i) => index === i),
      );

      node.init.argument.arguments[0].elements = elements.filter(
        (_, index) => !indices.some((i) => index === i),
      );

      if (node.id.elements.length === 1) {
        const [elementId] = node.id.elements;
        const [initElement] = node.init.argument.arguments[0].elements;

        if (
          elementId &&
          elementId.type !== "SpreadElement" &&
          initElement &&
          initElement.type !== "RestElement" &&
          initElement.type !== "SpreadElement"
        ) {
          node.id = elementId;

          node.init = {
            type: "AwaitExpression",
            argument: initElement,
          };
        }
      }

      const scope = variableDeclarator._computeScope();

      if (!scope?.path) {
        return;
      }

      identifierNames.forEach((name) => {
        j(scope.path)
          .find(j.Identifier, { name })
          .filter((path) => {
            const parent = path._computeParent();

            if (!parent || !("value" in parent)) {
              return true;
            }

            return parent.value?.type !== "JSXAttribute";
          })
          .replaceWith(() => {
            dirtyFlag = true;

            return {
              type: "BooleanLiteral",
              value: true,
            };
          });
      });
    });

  root
    .find(j.LogicalExpression, {
      type: "LogicalExpression",
      left: {
        type: "BooleanLiteral",
        value: true,
      },
      operator: "&&",
    })
    .replaceWith(({ node }) => {
      dirtyFlag = true;

      return node.right;
    });

  root
    .find(j.LogicalExpression, {
      type: "LogicalExpression",
      right: {
        type: "BooleanLiteral",
        value: true,
      },
      operator: "&&",
    })
    .replaceWith(({ node }) => {
      dirtyFlag = true;

      return node.left;
    });

  root
    .find(j.AwaitExpression, {
      type: "AwaitExpression",
      argument: {
        type: "BooleanLiteral",
      },
    })
    .replaceWith(({ node }) => {
      dirtyFlag = true;

      return node.argument;
    });

  return dirtyFlag ? root.toSource() : undefined;
}
