export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the meta function declaration
  root.find(j.FunctionDeclaration, { id: { name: 'meta' } }).forEach(path => {
    // Add args parameter to the meta function
    path.node.params = [j.identifier('args')];

    // Find the return statement inside the meta function
    j(path).find(j.ReturnStatement).forEach(returnPath => {
      const returnArgument = returnPath.node.argument;
      if (j.ObjectExpression.check(returnArgument)) {
        // Wrap the return object inside metaV1 call
        returnPath.node.argument = j.callExpression(
          j.identifier('metaV1'),
          [j.identifier('args'), returnArgument]
        );
        dirtyFlag = true;
      }
    });
  });

  // Add import statement for metaV1 if transformation was applied
  if (dirtyFlag) {
    const importStatement = j.importDeclaration(
      [j.importSpecifier(j.identifier('metaV1'))],
      j.literal('@remix-run/v1-meta')
    );
    root.get().node.program.body.unshift(importStatement);
  }

  return dirtyFlag ? root.toSource() : undefined;
}