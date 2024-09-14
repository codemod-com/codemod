import type {
  API,
  FileInfo,
  Identifier,
  Options,
  StringLiteral,
} from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  // Find Client import from 'elasticsearch'
  root
    .find(j.VariableDeclarator, {
      id: {
        type: "ObjectPattern",
        properties: [
          {
            type: "ObjectProperty",
            key: {
              type: "Identifier",
              name: "Client",
            },
          },
        ],
      },
      init: {
        callee: {
          type: "Identifier",
          name: "require",
        },
        arguments: [{ type: "StringLiteral", value: "elasticsearch" }],
      },
    })
    .forEach((path) => {
      if (path.node.init && j.CallExpression.check(path.node.init)) {
        (path.node.init.arguments[0] as StringLiteral).value =
          "@elastic/elasticsearch";
        isDirty = true;
      }
    });

  // Find Client instantiation with plugins
  root
    .find(j.NewExpression, {
      callee: { name: "Client" },
    })
    .forEach((path) => {
      const clientInit = path.node.arguments[0];
      const pluginsProperty = clientInit.properties.find(
        (prop) =>
          j.ObjectProperty.check(prop) &&
          (prop.key as Identifier).name === "plugins",
      );

      if (pluginsProperty) {
        // Remove plugins property from client initialization
        clientInit.properties = clientInit.properties.filter(
          (prop) => prop !== pluginsProperty,
        );

        // Insert separate client.extend calls for each plugin
        const plugins = pluginsProperty.value.elements;
        const clientVariable = path.parentPath.node.id.name;

        if (Array.isArray(plugins)) {
          plugins.reverse().forEach((plugin) => {
            console.log(plugin);
            const extendCall = j.expressionStatement(
              j.callExpression(
                j.memberExpression(
                  j.identifier(clientVariable),
                  j.identifier("extend"),
                ),
                [plugin],
              ),
            );

            j(path.parentPath.parent).insertAfter(extendCall);
          });
          isDirty = true;
        }
      }
    });

  return isDirty ? root.toSource(options) : undefined;
}
