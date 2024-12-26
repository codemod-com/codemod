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

  // Helper function to add `await` before `hasInitialized`
  function addAwaitInitialization(path) {
    const parent = path.parent.node;
    let variableName;
    if (parent.id && parent.id.name) {
      variableName = parent.id.name;
    } else if (parent.left && parent.left.name) {
      variableName = parent.left.name;
    }

    if (variableName) {
      const awaitExpression = j.awaitExpression(
        j.memberExpression(
          j.identifier(variableName),
          j.identifier("hasInitialized"),
        ),
      );
      const expressionStatement = j.expressionStatement(awaitExpression);
      j(path.parent.parent).insertAfter(expressionStatement);
    }
  }

  // Transform `StyleDictionary.extend` to `new StyleDictionary`
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "StyleDictionary" },
        property: { name: "extend" },
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      const newExpression = j.newExpression(
        j.identifier("StyleDictionary"),
        args,
      );
      j(path).replaceWith(newExpression);
      addAwaitInitialization(path);
    });

  // Transform `require` to `import`
  root.find(j.VariableDeclaration).forEach((path) => {
    const declaration = path.node.declarations[0];
    if (
      declaration.init &&
      declaration.init.callee &&
      declaration.init.callee.name === "require" &&
      declaration.init.arguments[0].value === "style-dictionary"
    ) {
      const importDeclaration = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier(declaration.id.name))],
        j.literal("style-dictionary"),
      );
      j(path).replaceWith(importDeclaration);
    }
  });

  // Handle class constructor and make it async if necessary
  root
    .find(j.MethodDefinition, {
      key: { name: "constructor" },
    })
    .forEach((path) => {
      const body = path.node.value.body.body;
      let requiresAsync = false;

      body.forEach((statement, index) => {
        if (
          j.ExpressionStatement.check(statement) &&
          j.CallExpression.check(statement.expression) &&
          statement.expression.callee.property &&
          statement.expression.callee.property.name === "extend"
        ) {
          requiresAsync = true;
          const variableName = statement.expression.callee.object.name;
          const awaitExpression = j.awaitExpression(
            j.memberExpression(
              j.identifier(variableName),
              j.identifier("hasInitialized"),
            ),
          );
          const expressionStatement = j.expressionStatement(awaitExpression);
          body.splice(index + 1, 0, expressionStatement);
        }
      });

      if (requiresAsync) {
        path.node.value.async = true;
      }
    });

  // Ensure functions containing new StyleDictionary are async
  root
    .find(j.FunctionDeclaration, {
      body: {
        body: (body) =>
          body.some(
            (statement) =>
              j.ExpressionStatement.check(statement) &&
              j.AwaitExpression.check(statement.expression) &&
              statement.expression.argument.property.name === "hasInitialized",
          ),
      },
    })
    .forEach((path) => {
      path.node.async = true;
    });

  root
    .find(j.FunctionExpression, {
      body: {
        body: (body) =>
          body.some(
            (statement) =>
              j.ExpressionStatement.check(statement) &&
              j.AwaitExpression.check(statement.expression) &&
              statement.expression.argument.property.name === "hasInitialized",
          ),
      },
    })
    .forEach((path) => {
      path.node.async = true;
    });

  root
    .find(j.ArrowFunctionExpression, {
      body: {
        body: (body) =>
          body.some(
            (statement) =>
              j.ExpressionStatement.check(statement) &&
              j.AwaitExpression.check(statement.expression) &&
              statement.expression.argument.property.name === "hasInitialized",
          ),
      },
    })
    .forEach((path) => {
      path.node.async = true;
    });

  return root.toSource();
}
