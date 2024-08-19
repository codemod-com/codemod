import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(file: FileInfo, api: API, options?: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all fastify.get calls
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "fastify" },
        property: { name: "get" },
      },
    })
    .forEach((path) => {
      const firstArg = path.value.arguments[0];

      // Ensure the first argument is a string literal
      if (j.Literal.check(firstArg) && typeof firstArg.value === "string") {
        const routePath = firstArg.value;

        // Check if the route path matches the pattern '/posts/:id'
        if (routePath === "/posts/:id") {
          // Update the route path to '/posts/:id?'
          firstArg.value = "/posts/:id?";
          dirtyFlag = true;
        }
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}
