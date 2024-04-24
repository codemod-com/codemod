import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
  const j = api.jscodeshift;

  const root = j(file.source);
  return root
    .find(j.CallExpression, {
      callee: {
        object: { name: "history" },
        property: { name: "push" },
      },
      // @ts-ignore Type '{ length: number; 0: { type: "ObjectExpression"; }; }' is not assignable to type 'undefined'.
      arguments: {
        length: 1,
        0: { type: "ObjectExpression" },
      },
    })
    .forEach((path) => {
      const arg = path.value.arguments[0];
      if (!j.ObjectExpression.check(arg)) {
        return;
      }
      const state = arg.properties.find(
        (property) =>
          j.Property.check(property) &&
          j.Identifier.check(property.key) &&
          property.key.name === "state",
      );

      if (!state) {
        return;
      }

      arg.properties = arg.properties.filter((property) => {
        if (
          j.Property.check(property) &&
          j.Identifier.check(property.key) &&
          property.key.name === "state"
        ) {
          return false;
        }
        return true;
      });

      // @ts-ignore Property 'value' does not exist on type 'SpreadElement'.
      path.value.arguments.push(state.value);
    })
    .toSource();
}

export default transform;
