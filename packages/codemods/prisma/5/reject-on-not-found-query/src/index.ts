import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  const transformMethod = (oldMethodName: string, newMethodName: string) => {
    root
      .find(j.CallExpression, {
        callee: {
          type: "MemberExpression",
          property: {
            name: oldMethodName,
          },
        },
      })
      .forEach((path) => {
        const argument = path.node.arguments[0];

        if (j.ObjectExpression.check(argument)) {
          const rejectOnNotFoundProperty = argument.properties.find(
            (property) =>
              j.ObjectProperty.check(property) &&
              j.Identifier.check(property.key) &&
              property.key.name === "rejectOnNotFound" &&
              j.BooleanLiteral.check(property.value) &&
              property.value.value === true,
          );

          if (rejectOnNotFoundProperty) {
            argument.properties = argument.properties.filter(
              (property) => property !== rejectOnNotFoundProperty,
            );

            path.get("callee", "property").replace(j.identifier(newMethodName));
          }
        }
      });
  };

  transformMethod("findFirst", "findFirstOrThrow");
  transformMethod("findUnique", "findUniqueOrThrow");

  return root.toSource();
}

export default transform;
