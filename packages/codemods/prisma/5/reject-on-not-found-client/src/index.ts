import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  const transformMethod = (methodName: string, newMethodName: string) => {
    root
      .find(j.CallExpression, {
        callee: {
          type: "MemberExpression",
          property: {
            name: methodName,
          },
        },
      })
      .forEach((path) => {
        const argument = path.node.arguments[0];

        if (j.ObjectExpression.check(argument)) {
          path.get("callee", "property").replace(j.identifier(newMethodName));
        }
      });
  };

  root
    .find(j.NewExpression, {
      callee: {
        type: "Identifier",
        name: "PrismaClient",
      },
    })
    .forEach((path) => {
      const argument = path.node.arguments[0];

      if (j.ObjectExpression.check(argument)) {
        const rejectOnNotFoundProperty = argument.properties.find(
          (property) =>
            j.ObjectProperty.check(property) &&
            j.Identifier.check(property.key) &&
            property.key.name === "rejectOnNotFound",
        );

        if (rejectOnNotFoundProperty) {
          if (
            j.ObjectProperty.check(rejectOnNotFoundProperty) &&
            j.BooleanLiteral.check(rejectOnNotFoundProperty.value) &&
            rejectOnNotFoundProperty.value.value === true
          ) {
            path.node.arguments = [];
            transformMethod("findFirst", "findFirstOrThrow");
            transformMethod("findUnique", "findUniqueOrThrow");
          } else if (
            j.ObjectProperty.check(rejectOnNotFoundProperty) &&
            j.ObjectExpression.check(rejectOnNotFoundProperty.value)
          ) {
            const findUniqueProperty =
              rejectOnNotFoundProperty.value.properties.find(
                (property) =>
                  j.ObjectProperty.check(property) &&
                  j.Identifier.check(property.key) &&
                  property.key.name === "findUnique" &&
                  j.BooleanLiteral.check(property.value) &&
                  property.value.value === true,
              );

            const findFirstProperty =
              rejectOnNotFoundProperty.value.properties.find(
                (property) =>
                  j.ObjectProperty.check(property) &&
                  j.Identifier.check(property.key) &&
                  property.key.name === "findFirst" &&
                  j.BooleanLiteral.check(property.value) &&
                  property.value.value === true,
              );

            if (findUniqueProperty) {
              path.node.arguments = [];
              transformMethod("findUnique", "findUniqueOrThrow");
            }

            if (findFirstProperty) {
              path.node.arguments = [];
              transformMethod("findFirst", "findFirstOrThrow");
            }
          }
        }
      }
    });

  return root.toSource();
}

export default transform;
