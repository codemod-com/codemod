import type { API, FileInfo, Options, Transform } from "jscodeshift";

const transform: Transform = (file: FileInfo, api: API, options: Options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  let dirtyFlag = false;

  // Find the render method and update it
  const renderMethods = root.find(j.ObjectMethod, { key: { name: "render" } });

  renderMethods.forEach((path) => {
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

  // If a render method was updated, add the import statement for 'h' from 'vue'
  if (dirtyFlag) {
    const hasHImport =
      root
        .find(j.ImportDeclaration, {
          source: { type: "Literal", value: "vue" },
        })
        .filter((path) => {
          return path.node.specifiers.some(
            (specifier) =>
              specifier.type === "ImportSpecifier" &&
              specifier.imported.name === "h",
          );
        })
        .size() > 0;

    if (!hasHImport) {
      const importStatement = j.importDeclaration(
        [j.importSpecifier(j.identifier("h"))],
        j.literal("vue"),
      );

      root.get().node.program.body.unshift(importStatement);
    }
  }

  if (!dirtyFlag) {
    return null;
  }

  return root.toSource(options);
};

export default transform;
