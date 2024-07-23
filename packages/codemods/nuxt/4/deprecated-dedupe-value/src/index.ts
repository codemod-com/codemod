import type { API, FileInfo, ObjectExpression, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  root
    .find(j.AwaitExpression, {
      argument: {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "refresh",
        },
        arguments: [
          {
            type: "ObjectExpression",
            properties: (props: any[]) =>
              props.some(
                (prop) =>
                  prop.type === "ObjectProperty" &&
                  prop.key.type === "Identifier" &&
                  prop.key.name === "dedupe" &&
                  (prop.value.type === "BooleanLiteral" ||
                    (prop.value.type === "Literal" &&
                      typeof prop.value.value === "boolean")),
              ),
          },
        ],
      },
    })
    .forEach((path) => {
      const callExpression = path.node.argument;
      if (j.CallExpression.check(callExpression)) {
        const args = callExpression.arguments;
        if (args.length > 0 && j.ObjectExpression.check(args[0])) {
          const objectArg = args[0] as ObjectExpression;

          objectArg.properties.forEach((prop) => {
            if (
              j.ObjectProperty.check(prop) &&
              j.Identifier.check(prop.key) &&
              prop.key.name === "dedupe"
            ) {
              if (
                j.BooleanLiteral.check(prop.value) ||
                (j.Literal.check(prop.value) &&
                  typeof prop.value.value === "boolean")
              ) {
                prop.value = j.stringLiteral(
                  (prop.value as any).value ? "cancel" : "defer",
                );
                isDirty = true;
              }
            }
          });
        }
      }
    });

  return isDirty ? root.toSource(options) : undefined;
}
