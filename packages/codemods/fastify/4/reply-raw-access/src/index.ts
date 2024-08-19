import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(file: FileInfo, api: API, options?: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all variable declarations
  root.find(j.VariableDeclarator).forEach((path) => {
    const init = path.node.init;

    // Check if the initializer is a member expression
    if (j.MemberExpression.check(init)) {
      const object = init.object;
      const property = init.property;

      // Check if the member expression is `reply.res`
      if (
        j.Identifier.check(object) &&
        object.name === "reply" &&
        j.Identifier.check(property) &&
        property.name === "res"
      ) {
        // Replace `reply.res` with `reply.raw`
        path
          .get("init")
          .replace(
            j.memberExpression(j.identifier("reply"), j.identifier("raw")),
          );
        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
