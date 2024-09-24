export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find require statements
  root
    .find(j.VariableDeclarator, {
      init: {
        callee: { name: "require" },
        arguments: [{ value: "jasmine-core/node_boot.js" }],
      },
    })
    .forEach((path) => {
      // Replace with require('jasmine-core').boot
      const requireCall = path.value.init;
      if (
        j.CallExpression.check(requireCall) &&
        requireCall.arguments.length === 1
      ) {
        const arg = requireCall.arguments[0];
        if (j.Literal.check(arg) && arg.value === "jasmine-core/node_boot.js") {
          path.value.init = j.memberExpression(
            j.callExpression(j.identifier("require"), [
              j.literal("jasmine-core"),
            ]),
            j.identifier("boot"),
          );
          dirtyFlag = true;
        }
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}
