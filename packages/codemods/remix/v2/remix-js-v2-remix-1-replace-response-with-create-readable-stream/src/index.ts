export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace Response instantiation with createReadableStreamFromReadable
  root.find(j.NewExpression, { callee: { name: "Response" } }).forEach(path => {
    const args = path.node.arguments;
    if (args.length > 0 && j.Identifier.check(args[0]) && args[0].name === "body") {
      path.node.arguments[0] = j.callExpression(j.identifier("createReadableStreamFromReadable"), [args[0]]);
      dirtyFlag = true;
    }
  });

  // Remove import of PassThrough from "node:stream" and Response from "@remix-run/node"
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    if (source === "node:stream" || source === "@remix-run/node") {
      path.node.specifiers = path.node.specifiers.filter(specifier => {
        if (j.ImportSpecifier.check(specifier)) {
          if (specifier.imported.name === "PassThrough" || specifier.imported.name === "Response") {
            return false;
          }
        }
        return true;
      });
      if (path.node.specifiers.length === 0) {
        j(path).remove();
      } else {
        dirtyFlag = true;
      }
    }
  });

  // Add import for createReadableStreamFromReadable from "@remix-run/node"
  if (dirtyFlag) {
    const importDeclaration = j.importDeclaration(
      [j.importSpecifier(j.identifier("createReadableStreamFromReadable"))],
      j.literal("@remix-run/node")
    );
    root.find(j.ImportDeclaration).at(0).insertBefore(importDeclaration);
  }

  return dirtyFlag ? root.toSource() : undefined;
}