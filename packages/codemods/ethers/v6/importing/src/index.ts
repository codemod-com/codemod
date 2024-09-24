export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Transform import statements
  root.find(j.ImportDeclaration).forEach((path) => {
    if (
      j.Literal.check(path.node.source) &&
      path.node.source.value === "@ethersproject/providers"
    ) {
      path.node.source.value = "ethers/providers";
      dirtyFlag = true;
    }
  });

  // Transform destructured InfuraProvider from providers object
  root.find(j.VariableDeclarator).forEach((path) => {
    if (
      j.ObjectPattern.check(path.node.id) &&
      path.node.init &&
      j.Identifier.check(path.node.init) &&
      path.node.init.name === "providers"
    ) {
      path.node.id.properties.forEach((property) => {
        if (
          j.Identifier.check(property.key) &&
          property.key.name === "InfuraProvider"
        ) {
          // Remove the entire variable declaration if it only contains InfuraProvider
          if (path.node.id.properties.length === 1) {
            j(path).remove();
          } else {
            // Remove the destructured InfuraProvider
            path.node.id.properties = path.node.id.properties.filter(
              (prop) => prop.key.name !== "InfuraProvider",
            );
          }
          // Add import statement for InfuraProvider from 'ethers'
          const importDeclaration = j.importDeclaration(
            [j.importSpecifier(j.identifier("InfuraProvider"))],
            j.literal("ethers"),
          );
          root.get().node.program.body.unshift(importDeclaration);
          dirtyFlag = true;
        }
      });
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
