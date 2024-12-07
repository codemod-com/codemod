export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all exported async function declarations
  root.find(j.FunctionDeclaration, { async: true }).forEach(path => {
    if (path.parentPath.value.type === 'ExportNamedDeclaration') {
      // Insert the new export statement before the first exported async function declaration
      const exportConst = j.exportNamedDeclaration(
        j.variableDeclaration('const', [
          j.variableDeclarator(
            j.identifier('dynamic'),
            j.literal('force-static')
          )
        ])
      );
      j(path.parentPath).insertBefore(exportConst);
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}