import type { API, FileInfo, Options, Transform } from "jscodeshift";

const transform: Transform = (file: FileInfo, api: API, options: Options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  let dirtyFlag = false;

  // Add import statement for 'h' from 'vue'
  const importStatement = j.importDeclaration(
    [j.importSpecifier(j.identifier("h"))],
    j.literal("vue"),
  );

  root.get().node.program.body.unshift(importStatement);
  dirtyFlag = true;

  // Find the render method and update it
  root.find(j.ObjectMethod, { key: { name: "render" } }).forEach((path) => {
    const params = path.value.params;
    if (
      params.length === 1 &&
      params[0].type === "Identifier" &&
      params[0].name === "h"
    ) {
      path.value.params = [];
      dirtyFlag = true;
    }
  });

  if (!dirtyFlag) {
    return undefined;
  }

  return root.toSource(options);
};

export default transform;
